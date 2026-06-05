document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos do Carrossel
    const track = document.getElementById('catalog-track');
    const btnPrev = document.querySelector('.slider-arrow--prev');
    const btnNext = document.querySelector('.slider-arrow--next');

    if (track && btnPrev && btnNext) {
        let isHolding = false;
        let pressTimer;
        let animationFrameId;
        let scrollDirection = 0; // 1 = Direita, -1 = Esquerda
        const scrollSpeed = 5;   // Velocidade fluida por frame (px)
        const holdDelay = 200;   // Tempo mínimo (ms) para ativar o "segurar"

        /* =======================================================
           1. LOGICA DE CLIQUE + LOOP INFINITO
           ======================================================= */
        const handleClick = (direction) => {
            // Reativa as transições nativas para o pulo individual
            track.style.scrollBehavior = 'smooth';
            track.style.scrollSnapType = 'x mandatory'; 
            
            const card = track.querySelector('.slider-card');
            if (!card) return;
            
            const cardWidth = card.offsetWidth + parseInt(window.getComputedStyle(track).gap || 30);
            const maxScroll = track.scrollWidth - track.clientWidth;

            if (direction === 1) { // Avançar
                // Se estiver muito próximo do fim, volta ao início suavemente
                if (track.scrollLeft >= maxScroll - 15) {
                    track.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            } else { // Voltar
                // Se estiver muito próximo do início, vai para o fim suavemente
                if (track.scrollLeft <= 15) {
                    track.scrollTo({ left: maxScroll, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                }
            }
        };

        /* =======================================================
           2. MOVIMENTO CONTÍNUO AO SEGURAR (Hold-to-Scroll)
           ======================================================= */
        const autoScroll = () => {
            if (!isHolding) return;
            
            const maxScroll = track.scrollWidth - track.clientWidth;
            
            // Verificação de limites durante o movimento contínuo
            if (scrollDirection === 1 && track.scrollLeft >= maxScroll - 5) {
                track.style.scrollBehavior = 'smooth';
                track.scrollTo({ left: 0, behavior: 'smooth' });
                stopContinuousScroll();
                return;
            } else if (scrollDirection === -1 && track.scrollLeft <= 5) {
                track.style.scrollBehavior = 'smooth';
                track.scrollTo({ left: maxScroll, behavior: 'smooth' });
                stopContinuousScroll();
                return;
            }

            track.scrollLeft += scrollSpeed * scrollDirection;
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        const startContinuousScroll = (direction) => {
            if (isHolding) return; // Evita loop de aceleração duplicada
            isHolding = true;
            scrollDirection = direction;
            
            // Desativa temporariamente o snap e o behavior para não travar o loop de animação
            track.style.scrollBehavior = 'auto'; 
            track.style.scrollSnapType = 'none'; 
            autoScroll();
        };

        const stopContinuousScroll = () => {
            isHolding = false;
            cancelAnimationFrame(animationFrameId);
        };

        /* =======================================================
           3. GERENCIADOR DE PONTEIROS (Mouse + Touch)
           ======================================================= */
        const setupButtonEvents = (btn, direction) => {
            const handlePointerDown = (e) => {
                if (e.cancelable) e.preventDefault(); 
                clearTimeout(pressTimer);
                isHolding = false;
                
                pressTimer = setTimeout(() => {
                    startContinuousScroll(direction);
                }, holdDelay);
            };

            const handlePointerUp = (e) => {
                clearTimeout(pressTimer);
                if (isHolding) {
                    stopContinuousScroll();
                    // Devolve o comportamento nativo suave ao soltar
                    track.style.scrollBehavior = 'smooth';
                    track.style.scrollSnapType = 'x mandatory';
                } else {
                    handleClick(direction);
                }
            };

            const handleLeave = () => {
                clearTimeout(pressTimer);
                if (isHolding) {
                    stopContinuousScroll();
                    track.style.scrollBehavior = 'smooth';
                    track.style.scrollSnapType = 'x mandatory';
                }
            };

            // Eventos Desktop
            btn.addEventListener('mousedown', handlePointerDown);
            btn.addEventListener('mouseup', handlePointerUp);
            btn.addEventListener('mouseleave', handleLeave);

            // Eventos Mobile
            btn.addEventListener('touchstart', handlePointerDown, { passive: false });
            btn.addEventListener('touchend', handlePointerUp, { passive: false });
            btn.addEventListener('touchcancel', handleLeave);
        };

        setupButtonEvents(btnPrev, -1);
        setupButtonEvents(btnNext, 1);

        /* =======================================================
           4. ARRASTE COM O MOUSE (Drag to Scroll - Desktop)
           ======================================================= */
        let isDown = false;
        let startX;
        let scrollLeftState;

        track.addEventListener('mousedown', (e) => {
            if (e.target.closest('.slider-arrow')) return; // Ignora se clicar nas setas
            isDown = true;
            track.style.cursor = 'grabbing';
            track.style.scrollBehavior = 'auto';
            track.style.scrollSnapType = 'none';
            startX = e.pageX - track.offsetLeft;
            scrollLeftState = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            track.style.cursor = 'grab';
            track.style.scrollBehavior = 'smooth';
            track.style.scrollSnapType = 'x mandatory';
        });

        track.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            track.style.cursor = 'grab';
            track.style.scrollBehavior = 'smooth';
            track.style.scrollSnapType = 'x mandatory';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2; // Multiplicador de velocidade do arrasto
            track.scrollLeft = scrollLeftState - walk;
        });
    }

    /* =======================================================
       5. CONTROLE DO ACCORDION DO FAQ PREMIUM (Unificado)
       ======================================================= */
    const faqTriggers = document.querySelectorAll('[data-faq-trigger]');
    
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const currentItem = this.parentElement;
            const content = this.nextElementSibling || currentItem.querySelector('.faq__content');
            if (!content) return;

            const isOpen = this.classList.contains('active') || currentItem.classList.contains('is-active');

            // Comportamento de Sanfona Única: Fecha todas as outras
            document.querySelectorAll('.faq__item').forEach(item => {
                item.classList.remove('is-active');
                const c = item.querySelector('.faq__content');
                if (c) c.style.maxHeight = null;
            });
            faqTriggers.forEach(t => t.classList.remove('active'));

            // Alterna o estado da pergunta atual com base nos seus padrões de classes
            if (!isOpen) {
                this.classList.add('active');
                currentItem.classList.add('is-active');
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                this.classList.remove('active');
                currentItem.classList.remove('is-active');
                content.style.maxHeight = null;
            }
        });
    });

    /* =======================================================
       6. NAVEGAÇÃO SUAVE DA NAVBAR
       ======================================================= */
    document.querySelectorAll('.navbar__link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

/* ==========================================================
   NOVAS FUNCIONALIDADES MOBILE (Refatoração Segura)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------
    // ETAPA 1: LÓGICA DO MENU HAMBÚRGUER
    // --------------------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    const overlay = document.querySelector('.menu-overlay');
    const navLinks = document.querySelectorAll('.navbar__link');

    if (hamburger && navbar && overlay) {
        
        const toggleMobileMenu = () => {
            if (window.innerWidth <= 768) {
                hamburger.classList.toggle('active');
                navbar.classList.toggle('active');
                overlay.classList.toggle('active');
                
                // Atualiza a acessibilidade do botão "X"
                const menuAberto = hamburger.classList.contains('active');
                hamburger.setAttribute('aria-expanded', menuAberto);
                
                // Trava o scroll do site quando o menu está aberto
                document.body.style.overflow = menuAberto ? 'hidden' : '';
            }
        };

        hamburger.addEventListener('click', toggleMobileMenu);
        overlay.addEventListener('click', toggleMobileMenu);

        // Fecha o menu suavemente ao clicar em um link (âncora)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbar.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });
    }

    // --------------------------------------------------------
    // ETAPA 2: LÓGICA DAS BOLINHAS DO CARROSSEL
    // --------------------------------------------------------
    const track = document.getElementById('catalog-track');
    const dotsContainer = document.getElementById('catalog-dots');

    if (track && dotsContainer) {
        const cards = track.querySelectorAll('.slider-card');
        
        // Gera as bolinhas dinamicamente baseadas na quantidade de cards
        cards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            dot.setAttribute('aria-label', `Mover para modelo ${index + 1}`);
            
            // Ativa a primeira bolinha por padrão
            if (index === 0) dot.classList.add('active');
            
            // Adiciona evento de clique na bolinha para rolar o catálogo
            dot.addEventListener('click', () => {
                if(window.innerWidth <= 768) {
                    const cardWidth = cards[0].offsetWidth;
                    // Calcula o espaço (gap) exato do CSS dinamicamente
                    const style = window.getComputedStyle(track);
                    const gap = parseFloat(style.gap) || 0;
                    
                    track.scrollTo({
                        left: (cardWidth + gap) * index,
                        behavior: 'smooth'
                    });
                }
            });
            
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.slider-dot');

        // Escuta o Scroll para atualizar a bolinha ativa
        track.addEventListener('scroll', () => {
            // A regra de negócio exige atuar apenas no mobile
            if(window.innerWidth > 768) return; 

            const scrollPosition = track.scrollLeft;
            const cardWidth = cards[0].offsetWidth;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 0;
            const itemWidth = cardWidth + gap;
            
            // Descobre qual card está predominantemente visível (Math.round)
            const activeIndex = Math.round(scrollPosition / itemWidth);

            // Atualiza a interface
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
    }
});
