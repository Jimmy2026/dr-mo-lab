        // ---- Nav two-state behavior ----
        (function() {
            const nav = document.querySelector('nav');
            if (!nav) return;
            function updateNav() {
                if (window.scrollY > 40) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }
            window.addEventListener('scroll', updateNav, { passive: true });
            updateNav();
        })();

        document.addEventListener('DOMContentLoaded', async function() {
            // The section files are inserted as direct children of <main>, in page order.
            const main = document.querySelector('main');
            const sectionNames = ['hero', 'acronym', 'updates', 'team', 'publications', 'contact'];
            try {
                const html = await Promise.all(sectionNames.map(async name => {
                    const response = await fetch(`sections/${name}.html`);
                    if (!response.ok) throw new Error(`Could not load ${name}: ${response.status}`);
                    return response.text();
                }));
                main.innerHTML = html.join('\n');
                main.removeAttribute('aria-busy');
            } catch (error) {
                console.error('Could not load page sections:', error);
                main.innerHTML = '<p role="alert" style="padding:140px 5vw;">The page could not load. Please refresh and try again.</p>';
                main.removeAttribute('aria-busy');
                return;
            }

            // Browsers try to follow a deep link before the section files exist.
            if (window.location.hash) {
                const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
                if (target) target.scrollIntoView({ behavior: 'instant' });
            }

            // ---- Smooth scrolling + mobile nav ----
            const mobileNav = document.getElementById('mobileNav');
            document.querySelectorAll('a[data-scroll]').forEach(a => {
                a.addEventListener('click', e => {
                    const href = a.getAttribute('href');
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        if (mobileNav) mobileNav.classList.remove('open');
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            const hamburgerBtn = document.getElementById('hamburgerBtn');
            const mobileClose = document.getElementById('mobileClose');
            if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => mobileNav.classList.add('open'));
            if (mobileClose) mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));

            // ---- Scrollspy ----
            const sections = document.querySelectorAll('main > section[id]');
            const navLinkMap = {};
            document.querySelectorAll('.nav-links a[data-scroll]').forEach(a => {
                navLinkMap[a.getAttribute('href')] = a;
            });
            if (sections.length && Object.keys(navLinkMap).length) {
                const spyObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const link = navLinkMap['#' + entry.target.id];
                            if (link) {
                                Object.values(navLinkMap).forEach(l => l.classList.remove('active'));
                                link.classList.add('active');
                            }
                        }
                    });
                }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
                sections.forEach(s => spyObserver.observe(s));
            }

            // ---- Scroll reveal ----
            const revealEls = document.querySelectorAll('.reveal');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((e, i) => {
                    if (e.isIntersecting) {
                        setTimeout(() => e.target.classList.add('visible'), i * 60);
                        revealObserver.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(el => revealObserver.observe(el));

            // ---- Acronym reveal ----
            (function() {
                const lines = document.querySelectorAll('#acronymLines .acro-line');
                const acronymSection = document.getElementById('acronym');
                if (!lines.length || !acronymSection) return;
                let fired = false;
                function fire() {
                    if (fired) return;
                    fired = true;
                    lines.forEach(el => {
                        setTimeout(() => el.classList.add('visible'), parseInt(el.dataset.delay || 0));
                    });
                }
                const obs = new IntersectionObserver(e => {
                    if (e[0].isIntersecting) { fire(); obs.disconnect(); }
                }, { threshold: 0.25 });
                obs.observe(acronymSection);
            })();

            // ---- Publication filter + pagination ----
            const pubSearch = document.getElementById('pubSearch');
            const itemsPerPageSelect = document.getElementById('itemsPerPage');
            const prevBtn = document.getElementById('prevPage');
            const nextBtn = document.getElementById('nextPage');
            const pageInfo = document.getElementById('pageInfo');
            const noResults = document.getElementById('noResults');

            let currentCategory = 'all';
            let currentPage = 1;
            let itemsPerPage = parseInt(itemsPerPageSelect.value) || 10;
            let totalPages = 1;
            let filteredCards = [];

            function getAllCards() {
                return Array.from(document.querySelectorAll('.pub-card:not(#noResults)'));
            }

            function applyFilter() {
                const q = pubSearch ? pubSearch.value.toLowerCase().trim() : '';
                const allCards = getAllCards();
                filteredCards = allCards.filter(card => {
                    const matchCat = currentCategory === 'all' || card.dataset.type === currentCategory;
                    const matchQ = !q || card.dataset.text.includes(q) || card.innerText.toLowerCase().includes(q);
                    return matchCat && matchQ;
                });
                if (noResults) {
                    noResults.style.display = filteredCards.length === 0 ? 'block' : 'none';
                }
                currentPage = 1;
                renderPage();
            }

            function renderPage() {
                const total = filteredCards.length;
                const perPage = itemsPerPage === 0 ? total : itemsPerPage;
                totalPages = perPage === 0 ? 1 : Math.ceil(total / perPage);
                if (currentPage > totalPages) currentPage = totalPages;
                if (currentPage < 1) currentPage = 1;

                const start = (currentPage - 1) * perPage;
                const end = perPage === 0 ? total : Math.min(start + perPage, total);

                getAllCards().forEach(c => c.style.display = 'none');
                for (let i = start; i < end; i++) {
                    if (filteredCards[i]) filteredCards[i].style.display = '';
                }

                pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
                prevBtn.disabled = currentPage <= 1;
                nextBtn.disabled = currentPage >= totalPages;
            }

            window.filterCat = function(cat, btn) {
                currentCategory = cat;
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter();
            };

            if (pubSearch) pubSearch.addEventListener('input', applyFilter);

            if (itemsPerPageSelect) {
                itemsPerPageSelect.addEventListener('change', function() {
                    itemsPerPage = parseInt(this.value) || 10;
                    currentPage = 1;
                    renderPage();
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    if (currentPage > 1) {
                        currentPage--;
                        renderPage();
                    }
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderPage();
                    }
                });
            }

            applyFilter();

            // ---- Contact form ----
            window.handleContactSubmit = function(e) {
                e.preventDefault();
                const form = e.target;
                const statusEl = document.getElementById('formStatus');
                const btn = document.getElementById('formSubmitBtn');
                const showStatus = (msg, ok) => {
                    statusEl.textContent = msg;
                    statusEl.style.display = 'block';
                    statusEl.style.color = ok ? '#2f7d4f' : '#a12a2a';
                };

                if (form.action.includes('YOUR_FORM_ID')) {
                    showStatus('This form isn\u2019t connected yet \u2014 see the README for the 2-minute Formspree setup.', false);
                    return;
                }

                btn.disabled = true;
                btn.textContent = 'Sending\u2026';

                fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                }).then(response => {
                    if (response.ok) {
                        showStatus('Message sent \u2014 we\u2019ll respond within 2\u20133 business days.', true);
                        form.reset();
                    } else {
                        showStatus('Something went wrong sending your message. Please try again or email us directly.', false);
                    }
                }).catch(() => {
                    showStatus('Something went wrong sending your message. Please try again or email us directly.', false);
                }).finally(() => {
                    btn.disabled = false;
                    btn.textContent = 'Send Message';
                });
            };

            // ---- Graceful fallback for missing images ----
            document.querySelectorAll('.member-photo img, .pi-photo img').forEach(img => {
                img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
            });
        });
