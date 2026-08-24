/*
 * Minimal templating engine — no dependencies, runs in browser or Node.
 * Supported syntax:
 *   {{path.to.value}}      escaped text
 *   {{{path.to.value}}}    raw / unescaped HTML
 *   {{#each path}}...{{/each}}   loop over an array; inside, {{this}} / {{prop}} refer to
 *                                 the current item, and {{@index}} is a 0-based counter
 *   {{#if path}}...{{/if}}       renders block only if value is truthy
 *   {{#if path}}...{{else}}...{{/if}}
 * Variable lookup checks the current context first, then walks up to parent
 * contexts (so globals like {{site.labName}} stay reachable inside a loop).
 */
(function (root) {
  "use strict";

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getPath(stack, path) {
    if (path === "this" || path === ".") return stack[stack.length - 1];
    if (path === "@index") return stack.__index;
    var parts = path.split(".");
    for (var i = stack.length - 1; i >= 0; i--) {
      var ctx = stack[i];
      var cur = ctx;
      var ok = true;
      for (var p = 0; p < parts.length; p++) {
        if (cur === null || cur === undefined || !(parts[p] in Object(cur))) {
          ok = false;
          break;
        }
        cur = cur[parts[p]];
      }
      if (ok) return cur;
    }
    return undefined;
  }

  // Tokenize + build a simple AST so #each / #if can nest arbitrarily.
  function parse(tpl) {
    var tagRe = /\{\{\{?\s*([^{}]+?)\s*\}?\}\}/g;
    var pos = 0, match;
    var root = { type: "root", children: [] };
    var stack = [root];

    function top() { return stack[stack.length - 1]; }

    while ((match = tagRe.exec(tpl))) {
      var raw = match[0];
      var isRaw = raw.slice(0, 3) === "{{{";
      var inner = match[1].trim();
      var textBefore = tpl.slice(pos, match.index);
      if (textBefore) top().children.push({ type: "text", value: textBefore });
      pos = match.index + raw.length;

      if (inner.indexOf("#each ") === 0) {
        var node = { type: "each", path: inner.slice(6).trim(), children: [] };
        top().children.push(node);
        stack.push(node);
      } else if (inner.indexOf("#if ") === 0) {
        var ifNode = { type: "if", path: inner.slice(4).trim(), children: [], elseChildren: null };
        top().children.push(ifNode);
        stack.push(ifNode);
      } else if (inner === "else") {
        var cur = top();
        cur.elseChildren = [];
        cur.__inElse = true;
        // swap children target to elseChildren by pushing a marker frame
        stack.push({ type: "__elseFrame", children: cur.elseChildren, __owner: cur });
      } else if (inner === "/each" || inner === "/if") {
        // pop possible else-frame first
        if (top().type === "__elseFrame") stack.pop();
        stack.pop();
      } else {
        top().children.push({ type: isRaw ? "raw" : "var", path: inner });
      }
    }
    var rest = tpl.slice(pos);
    if (rest) top().children.push({ type: "text", value: rest });
    return root;
  }

  function renderNodes(nodes, ctxStack) {
    var out = "";
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.type === "text") {
        out += n.value;
      } else if (n.type === "var") {
        out += escapeHtml(getPath(ctxStack, n.path));
      } else if (n.type === "raw") {
        var v = getPath(ctxStack, n.path);
        out += v === undefined || v === null ? "" : String(v);
      } else if (n.type === "if") {
        var val = getPath(ctxStack, n.path);
        var truthy = val && !(Array.isArray(val) && val.length === 0);
        if (truthy) {
          out += renderNodes(n.children, ctxStack);
        } else if (n.elseChildren) {
          out += renderNodes(n.elseChildren, ctxStack);
        }
      } else if (n.type === "each") {
        var arr = getPath(ctxStack, n.path) || [];
        for (var j = 0; j < arr.length; j++) {
          ctxStack.push(arr[j]);
          ctxStack.__index = j;
          out += renderNodes(n.children, ctxStack);
          ctxStack.pop();
        }
      }
    }
    return out;
  }

  function render(tpl, data) {
    var ast = parse(tpl);
    var stack = [data];
    return renderNodes(ast.children, stack);
  }

  var api = { render: render };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.TemplateEngine = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
