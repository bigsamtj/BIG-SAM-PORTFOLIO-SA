import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// PROJECT DATA
// Replace each BIGSAMDROPLINKHERE with your actual
// documentation / case study / GitHub / report link.
// ============================================================

const projectsData = [
  {
    title: "Mobile Forensic: Operation SIM Swap",
    category: "MOBILE FORENSICS • FRAUD INVESTIGATION",
    description:
      "A mobile-forensics investigation into a SIM-swap and financial-fraud scenario. Reconstructed the chain from social engineering and SIM replacement through new-device activation, account takeover, PIN change, and downstream fund movement.",
    tags: [
      "Mobile Forensics",
      "SIM Swap",
      "Fraud Investigation",
      "Timeline Analysis"
    ],
    match: "CASE",
    episode: "CASE 01",
    link: "https://www.linkedin.com/posts/bigsamtj_mobile-forensics-operation-sim-shift-investigation-activity-7497318812946653184-fV_V?utm_source=share&utm_medium=member_ios&rcm=ACoAADCrjx0BgQ6Xzl__aefqo51Fx2qFhDDulOI"
  },

  {
    title: "Digital Forensics & Password Recovery Workflow",
    category: "DIGITAL FORENSICS • PASSWORD RECOVERY",
    description:
      "A forensic workflow involving ZIP encryption, steganography, and password recovery. Developed and executed a brute-force automation script that successfully recovered a forgotten password after 64K attempts.",
    tags: [
      "Digital Forensics",
      "Steganography",
      "Password Recovery",
      "Automation"
    ],
    match: "LAB",
    episode: "CASE 02",
    link: "https://drive.google.com/drive/u/0/mobile/folders/1yIZ3hE4-sbeHPNIKecTMTKEV6YaegKhF/1IK3wSjIS9lJqSk500XG2Ja4uH3Jzf0Lh?usp=drive_link&sort=13&direction=a"
  },

  {
    title: "Network Attack Simulation: ARP Spoofing + Packet Sniffing",
    category: "NETWORK SECURITY • ATTACK SIMULATION",
    description:
      "Performed an attacker-victim simulation using ARP spoofing to demonstrate packet interception and traffic manipulation on a LAN. Analyzed the resulting network behavior in Wireshark from both offensive and defensive perspectives.",
    tags: [
      "Network Security",
      "ARP Spoofing",
      "Wireshark",
      "Packet Analysis"
    ],
    match: "LAB",
    episode: "CASE 03",
    link: "https://drive.google.com/drive/u/0/mobile/folders/1yIZ3hE4-sbeHPNIKecTMTKEV6YaegKhF/1IK3wSjIS9lJqSk500XG2Ja4uH3Jzf0Lh?usp=drive_link&sort=13&direction=a"
  },

  {
    title: "TLS, OpenSSL & Wireshark Encryption Analysis",
    category: "CRYPTOGRAPHY • NETWORK ANALYSIS",
    description:
      "Generated cryptographic keys and certificates using OpenSSL, performed TLS handshake simulations, and analyzed encrypted packet flows in Wireshark to strengthen understanding of encryption protocols, cipher suites, and secure communication.",
    tags: [
      "Cryptography",
      "OpenSSL",
      "TLS",
      "Wireshark"
    ],
    match: "LAB",
    episode: "CASE 04",
    link: "https://drive.google.com/drive/u/0/mobile/folders/1yIZ3hE4-sbeHPNIKecTMTKEV6YaegKhF/1IK3wSjIS9lJqSk500XG2Ja4uH3Jzf0Lh?usp=drive_link&sort=13&direction=a"
  },

  {
    title: "Digital Forensics: Firmware Overwrite Investigation",
    category: "DIGITAL FORENSICS • FILE ANALYSIS",
    description:
      "Investigated a corrupted CSV file and determined that the data had been overwritten with Qualcomm/JBOOT firmware rather than encrypted or damaged. Used hashing, entropy evaluation, hex inspection, and Binwalk analysis to confirm data loss and evaluate recovery paths.",
    tags: [
      "Digital Forensics",
      "Firmware Analysis",
      "Hex Analysis",
      "Binwalk"
    ],
    match: "CASE",
    episode: "CASE 05",
    link: "https://drive.google.com/drive/u/0/mobile/folders/1yIZ3hE4-sbeHPNIKecTMTKEV6YaegKhF/1IK3wSjIS9lJqSk500XG2Ja4uH3Jzf0Lh?usp=drive_link&sort=13&direction=a"
  },

  {
    title: "Black Box Penetration Testing — Kioptrix Level 1",
    category: "ETHICAL HACKING • PENETRATION TESTING",
    description:
      "Configured attacker and target virtual machines and performed host discovery, enumeration, and service identification using Nmap, Nessus, and EyeWitness. Organized reconnaissance findings and validated attack-surface preparation for the next phase of testing.",
    tags: [
      "Ethical Hacking",
      "Reconnaissance",
      "Nmap",
      "Nessus"
    ],
    match: "LAB",
    episode: "CASE 06",
    link: "https://youtu.be/6Xmgaa08t2M?si=2QiOEjjwEYTlxvt_"
  },

  {
    title: "DES Encryption",
    category: "CRYPTOGRAPHY • SECURITY RESEARCH",
    description:
      "Explored the Data Encryption Standard and examined why a cipher once used to protect banks, ATMs, and government systems is now considered insecure.",
    tags: [
      "Cryptography",
      "DES",
      "Encryption",
      "Security Research"
    ],
    match: "RESEARCH",
    episode: "CASE 07",
    link: "https://docs.google.com/document/u/0/d/1X9DzUrwttnX8ZkFVtRQ6hPnaLL3irUHpr6x_4Xf5BDQ/mobilebasic?pli=1"
  },

  {
    title: "Network Forensics using Wireshark",
    category: "NETWORK FORENSICS • INCIDENT RESPONSE",
    description:
      "Analyzed identified malicious network traffic using Wireshark and NetworkMiner to map attacker routes, reconstruct the attack timeline, identify network and host-based indicators of compromise, and develop recommendations for preventing similar incidents.",
    tags: [
      "Network Forensics",
      "Wireshark",
      "NetworkMiner",
      "IOC Analysis"
    ],
    match: "CASE",
    episode: "CASE 08",
    link: "https://drive.google.com/drive/u/0/mobile/folders/1yIZ3hE4-sbeHPNIKecTMTKEV6YaegKhF/1IK3wSjIS9lJqSk500XG2Ja4uH3Jzf0Lh?usp=drive_link&sort=13&direction=a"
  }
];

const Projects = () => {
  const containerRef = useRef(null);
  const folderBackRef = useRef(null);
  const folderFrontRef = useRef(null);
  const cardsRef = useRef([]);
  const mobileCardsRef = useRef([]);
  const mobileCarouselRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {

      // ========================================================
      // INITIAL FOLDER POSITION
      // ========================================================

      gsap.set(
        [folderBackRef.current, folderFrontRef.current],
        {
          xPercent: -50,
          yPercent: -50
        }
      );

      gsap.set(folderFrontRef.current, {
        transformOrigin: "bottom center"
      });

      // ========================================================
      // DESKTOP GRID POSITION
      // ========================================================

      const getGridPos = (index) => {
        let row, col;

        if (index < 3) {
          row = 0;
          col = index;
        } else if (index === 3) {
          row = 1;
          col = 0;
        } else if (index === 4) {
          row = 1;
          col = 2;
        } else {
          row = 2;
          col = index - 5;
        }

        return { row, col };
      };

      // ========================================================
      // INITIAL CARD STATE
      // ========================================================

      cardsRef.current.forEach((card) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          rotation: gsap.utils.random(-6, 6),
          scale: 0.85,
          x: 0,
          y: 0
        });
      });

      // ========================================================
      // RESPONSIVE GSAP
      // ========================================================

      let mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)"
        },
        (context) => {

          let { isDesktop, isMobile } = context.conditions;

          // ======================================================
          // DESKTOP ANIMATION
          // ======================================================

          if (isDesktop) {

            let floatTween;

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 50%",
                end: "bottom 50%",
                toggleActions: "play reverse play reverse",

                onEnter: () => {
                  if (floatTween) floatTween.kill();
                },

                onEnterBack: () => {
                  if (floatTween) floatTween.kill();
                },

                onLeave: () => {
                  if (floatTween) floatTween.kill();
                },

                onLeaveBack: () => {
                  if (floatTween) floatTween.kill();
                }
              },

              onComplete: () => {

                floatTween = gsap.to(cardsRef.current, {
                  y: "+=12",
                  rotation: "+=1",
                  duration: 3.5,
                  yoyo: true,
                  repeat: -1,
                  ease: "sine.inOut",
                  stagger: {
                    amount: 1.5,
                    from: "random"
                  }
                });

              }
            });

            // ----------------------------------------------------
            // 1. OPEN FOLDER
            // ----------------------------------------------------

            tl.to(folderFrontRef.current, {
              rotationX: -130,
              duration: 1.2,
              ease: "power3.inOut"
            });

            // ----------------------------------------------------
            // 2. CARDS RISE
            // ----------------------------------------------------

            tl.to(
              cardsRef.current,
              {
                y: -140,
                scale: 0.9,
                zIndex: 70,
                duration: 0.6,
                stagger: 0.04,
                ease: "back.out(1.2)"
              },
              "-=0.6"
            );

            // ----------------------------------------------------
            // 3. SPREAD INTO GRID
            // ----------------------------------------------------

            tl.to(
              cardsRef.current,
              {
                x: (i) => {

                  const w =
                    Math.max(
                      ...cardsRef.current.map(
                        c => c?.offsetWidth || 0
                      )
                    ) || 360;

                  const gap = 40;
                  const { col } = getGridPos(i);

                  return (col - 1) * (w + gap);
                },

                y: (i) => {

                  const h =
                    Math.max(
                      ...cardsRef.current.map(
                        c => c?.offsetHeight || 0
                      )
                    ) || 240;

                  const gap = 40;
                  const { row } = getGridPos(i);

                  return (row - 1) * (h + gap);
                },

                rotation: () => gsap.utils.random(-3, 3),

                scale: 1,

                duration: 1.4,

                stagger: {
                  amount: 0.4,
                  from: "center"
                },

                ease: "expo.out"
              },
              "-=0.2"
            );
          }

          // ======================================================
          // MOBILE ANIMATION
          // ======================================================

          if (isMobile) {

            const cardW = window.innerWidth * 0.8;
            const gap = 20;

            mobileCardsRef.current.forEach((card, i) => {

              gsap.set(card, {
                x: -(i * (cardW + gap)),
                y: 0,
                scale: 0.4,
                opacity: 0,
                rotation: gsap.utils.random(-15, 15)
              });

            });

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 60%"
              }
            });

            // ----------------------------------------------------
            // OPEN FOLDER
            // ----------------------------------------------------

            tl.to(folderFrontRef.current, {
              rotationX: -130,
              duration: 0.8,
              ease: "power3.inOut"
            });

            // ----------------------------------------------------
            // BRING MOBILE CARDS FORWARD
            // ----------------------------------------------------

            tl.to(
              mobileCardsRef.current,
              {
                y: -100,
                opacity: 1,
                scale: 0.85,
                duration: 0.6,
                stagger: 0.05,
                ease: "back.out(1.2)"
              },
              "-=0.4"
            );

            // ----------------------------------------------------
            // PLACE CARDS INTO CAROUSEL
            // ----------------------------------------------------

            tl.to(
              mobileCardsRef.current,
              {
                x: 0,
                y: 0,
                rotation: 0,

                scale: (i) =>
                  i === 0 ? 1 : 0.92,

                opacity: (i) =>
                  i === 0 ? 1 : 0.5,

                duration: 0.8,

                stagger: 0.08,

                ease: "expo.out",

                onComplete: () => {

                  if (mobileCarouselRef.current) {

                    mobileCarouselRef.current.style.overflowX =
                      "auto";

                    mobileCarouselRef.current.style.pointerEvents =
                      "auto";
                  }

                }
              },
              "-=0.2"
            );
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();

  }, []);

  return (

    <section
      id="projects"
      ref={containerRef}
      className="bg-[#0b0b0b] min-h-[100svh] md:min-h-[170vh] relative font-sans overflow-x-clip text-white w-full flex items-center justify-center py-24 md:py-40 select-none"
    >

      {/* ========================================================
          BACKGROUND TITLE
      ======================================================== */}

      <div className="absolute top-10 left-0 w-full flex items-start justify-center pointer-events-none z-0">

        <h1 className="text-[14vw] sm:text-[17vw] md:text-[20vw] font-black text-white/[0.03] tracking-tighter leading-none whitespace-nowrap uppercase">

          ORIGINALS

        </h1>

      </div>

      {/* ========================================================
          AMBIENT RED GLOW
      ======================================================== */}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] bg-red-600/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* ========================================================
          MAIN PERSPECTIVE CONTAINER
      ======================================================== */}

      <div className="mt-12 relative w-full max-w-7xl h-full flex items-center justify-center perspective-[2000px] z-10">

        {/* Origin Container */}

        <div className="relative w-0 h-0 transform-style-3d">

          {/* ====================================================
              FOLDER BACK
          ==================================================== */}

          <div
            ref={folderBackRef}
            className="absolute w-[85vw] md:w-[32vw] max-w-[380px] aspect-video bg-[#141414] rounded-[24px] border border-red-600/40 shadow-[0_20px_50px_rgba(229,9,20,0.25)] flex items-center justify-center"
            style={{ zIndex: 5 }}
          >

            <div className="absolute -top-6 left-6 w-32 h-8 bg-[#1f1f1f] rounded-t-xl border-t border-red-600/30" />

            <div className="relative z-10 text-red-600 font-mono font-black text-2xl tracking-widest uppercase opacity-60">

              ARCHIVE_SLOTS

            </div>

          </div>

          {/* ====================================================
              DESKTOP PROJECT CARDS
          ==================================================== */}

          {projectsData.map((project, i) => (

            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="hidden md:block absolute w-[80vw] md:w-[33vw] max-w-[380px] aspect-[16/10] will-change-transform"
              style={{ zIndex: 10 + i }}
            >

              <div className="w-full h-full rounded-[24px] overflow-hidden border border-white/15 bg-[#141414]/95 backdrop-blur-2xl shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-all duration-500 group hover:scale-[1.04] hover:border-red-600 hover:shadow-[0_35px_80px_rgba(229,9,20,0.35)] hover:-translate-y-2 cursor-pointer relative z-10 p-7 flex flex-col justify-between">

                {/* ------------------------------------------------
                    TOP HEADER
                ------------------------------------------------ */}

                <div className="flex items-center justify-between">

                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-500 bg-red-600/10 px-2.5 py-1 rounded border border-red-600/20">

                    {project.episode}

                  </span>

                  <div className="flex items-center gap-2">

                    <span className="text-xs font-mono text-red-400 font-bold">

                      {project.match}

                    </span>

                    <span className="text-[10px] font-mono border border-white/30 px-1 text-white/70">

                      HD

                    </span>

                  </div>

                </div>

                {/* ------------------------------------------------
                    TITLE + DESCRIPTION
                ------------------------------------------------ */}

                <div className="space-y-2 my-auto">

                  <div className="text-[11px] font-mono uppercase tracking-widest text-white/40">

                    {project.category}

                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors duration-300">

                    {project.title}

                  </h3>

                  <p className="text-xs text-white/70 font-light leading-relaxed line-clamp-2">

                    {project.description}

                  </p>

                </div>

                {/* ------------------------------------------------
                    TECH TAGS
                ------------------------------------------------ */}

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">

                  {project.tags.map((tag, tIdx) => (

                    <span
                      key={tIdx}
                      className="text-[10px] font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded"
                    >

                      {tag}

                    </span>

                  ))}

                </div>

                {/* ------------------------------------------------
                    DOCUMENTATION LINK
                ------------------------------------------------ */}

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-white transition-colors duration-300 w-fit"
                >

                  VIEW CASE FILE

                  <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">

                    →

                  </span>

                </a>

                {/* RED CORNER ACCENT */}

                <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-red-600 group-hover:shadow-[0_0_15px_#E50914] transition-all" />

              </div>

            </div>

          ))}

          {/* ====================================================
              FOLDER FRONT FLAP
          ==================================================== */}

          <div
            ref={folderFrontRef}
            className="absolute w-[85vw] md:w-[32vw] max-w-[380px] aspect-video pointer-events-none will-change-transform"
            style={{ zIndex: 60 }}
          >

            <div className="absolute bottom-0 w-full h-[85%] bg-[#1c1c1c] rounded-b-[24px] rounded-t-md shadow-[0_-5px_20px_rgba(0,0,0,0.8)] flex flex-col justify-end p-6 border-t border-red-600/40">

              <div className="w-20 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          MOBILE SWIPEABLE CAROUSEL
      ======================================================== */}

      <div
        ref={mobileCarouselRef}
        className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto py-12 flex items-center gap-6 px-[12.5vw] pointer-events-none z-[100] snap-x snap-mandatory overflow-x-hidden hide-scrollbar"
      >

        <style>{`

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

        `}</style>

        {projectsData.map((project, i) => (

          <div
            key={`mob-${i}`}
            ref={el => mobileCardsRef.current[i] = el}
            className="shrink-0 w-[78vw] aspect-[16/11] snap-center will-change-transform relative z-10"
          >

            <div className="w-full h-full rounded-[24px] overflow-hidden border border-white/15 bg-[#141414] p-6 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.9)]">

              {/* MOBILE HEADER */}

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 bg-red-600/10 px-2 py-0.5 rounded">

                  {project.episode}

                </span>

                <span className="text-xs font-mono text-red-400 font-bold">

                  {project.match}

                </span>

              </div>

              {/* MOBILE TITLE */}

              <div className="space-y-2">

                <h3 className="text-xl font-black text-white">

                  {project.title}

                </h3>

                <p className="text-xs text-white/70 font-light line-clamp-2">

                  {project.description}

                </p>

              </div>

              {/* MOBILE TAGS */}

              <div className="flex flex-wrap gap-1 pt-2 border-t border-white/10">

                {project.tags.slice(0, 3).map((tag, tIdx) => (

                  <span
                    key={tIdx}
                    className="text-[10px] font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded"
                  >

                    {tag}

                  </span>

                ))}

              </div>

              {/* MOBILE DOCUMENTATION LINK */}

              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-white transition-colors duration-300 w-fit"
              >

                VIEW CASE FILE

                <span className="text-sm">

                  →

                </span>

              </a>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default Projects;
