"use client";

import { useState, useEffect } from "react";

type Stage = "idle" | "opening" | "letter" | "entering" | "done";

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.1).toFixed(1)}%`,
  delay: `${((i * 0.6) % 5).toFixed(1)}s`,
  duration: `${(6 + (i % 4) * 1.5).toFixed(1)}s`,
  w: 8 + (i % 3) * 4,
  color: ["#FFB7C5","#FFC2CC","#FFAEC9","#FFD1DC","#FF9EB5","#FDE8EE"][i % 6],
}));

export function LetterIntro() {
  const [stage, setStage] = useState<Stage>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem("gs-intro") === "1") setStage("done");
    } catch {}
  }, []);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("opening");
    setTimeout(() => setStage("letter"), 1100);
  };

  const handleEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStage("entering");
    try { sessionStorage.setItem("gs-intro", "1"); } catch {}
    setTimeout(() => setStage("done"), 900);
  };

  if (!mounted || stage === "done") return null;

  const flapOpen = stage === "opening" || stage === "letter" || stage === "entering";
  const showLetter = stage === "letter" || stage === "entering";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        className={`li-root${stage === "entering" ? " li-fading" : ""}`}
        onClick={stage === "idle" ? handleOpen : undefined}
      >
        {PETALS.map((p, i) => (
          <span key={i} className="li-petal" style={{
            left: p.left, width: p.w, height: p.w * 1.5,
            background: p.color,
            animationDelay: p.delay, animationDuration: p.duration,
          }} />
        ))}

        {/* Envelope */}
        <div className={`li-env${showLetter ? " li-env-gone" : ""}`}>
          <div className="li-env-body">
            <div className="li-fold-l" /><div className="li-fold-r" /><div className="li-fold-b" />
          </div>
          <div className={`li-flap${flapOpen ? " li-flap-open" : ""}`} />
          {!flapOpen && <div className="li-seal">🌸</div>}
          {stage === "idle" && <p className="li-hint">Nhấn để mở bức thư 💌</p>}
        </div>

        {/* Letter */}
        {showLetter && (
          <div className={`li-letter${stage === "entering" ? " li-letter-exit" : ""}`}>
            <span className="li-deco li-tl">🌸</span>
            <span className="li-deco li-tr">🌸</span>
            <span className="li-deco li-bl">🌸</span>
            <span className="li-deco li-br">🌸</span>
            <div className="li-inner">
              <div className="li-orn">✦ ✦ ✦</div>
              <h1 className="li-title">Kính gửi quý khách 💕</h1>
              <div className="li-orn">— ✦ —</div>
              <p className="li-body">
                Chào mừng bạn đến với <strong>GlowSkin</strong> —<br />
                nơi vẻ đẹp của bạn được nâng niu và tôn vinh.<br /><br />
                Chúng tôi trân trọng gửi tới bạn những sản phẩm<br />
                mỹ phẩm cao cấp, chính hãng, được chắt lọc<br />
                với tình yêu và sự tận tâm.
              </p>
              <p className="li-ps">✨ Hãy để GlowSkin đồng hành cùng nét đẹp của bạn ✨</p>
              <div className="li-sig">Với yêu thương,<br /><em>GlowSkin</em> 🌸</div>
              <button className="li-btn" onClick={handleEnter}>Khám phá GlowSkin →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const CSS = `
.li-root{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFF0F8,#FFE0EE,#FFDDE8);overflow:hidden;transition:opacity .9s ease;}
.li-fading{opacity:0!important;pointer-events:none;}

.li-petal{position:absolute;top:-40px;border-radius:50% 0 50% 0;opacity:0;animation:liPetal linear infinite;}
@keyframes liPetal{0%{transform:translateY(0) rotate(0deg);opacity:0}5%{opacity:.75}50%{transform:translateY(50vh) rotate(180deg) translateX(18px);opacity:.6}95%{opacity:.35}100%{transform:translateY(108vh) rotate(360deg) translateX(-10px);opacity:0}}

.li-env{position:relative;width:340px;height:230px;cursor:pointer;animation:liFloat 3.5s ease-in-out infinite;transition:opacity .4s,transform .3s;filter:drop-shadow(0 20px 48px rgba(180,80,120,.28));}
.li-env:hover{transform:scale(1.04) translateY(-6px);}
.li-env-gone{opacity:0;transform:scale(.9) translateY(40px)!important;pointer-events:none;animation:none!important;}
@keyframes liFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}

.li-env-body{position:absolute;inset:0;background:linear-gradient(160deg,#FFF8F2,#FFE8D6);border-radius:8px;border:2px solid #E8A8A8;overflow:hidden;}
.li-fold-l,.li-fold-r,.li-fold-b{position:absolute;width:0;height:0;}
.li-fold-l{top:0;left:0;border-left:170px solid rgba(220,140,150,.18);border-top:115px solid transparent;border-bottom:115px solid transparent;}
.li-fold-r{top:0;right:0;border-right:170px solid rgba(220,140,150,.18);border-top:115px solid transparent;border-bottom:115px solid transparent;}
.li-fold-b{bottom:0;left:0;right:0;margin:0 auto;border-left:170px solid transparent;border-right:170px solid transparent;border-bottom:120px solid rgba(220,140,150,.15);}

.li-flap{position:absolute;top:0;left:0;width:0;height:0;border-left:170px solid transparent;border-right:170px solid transparent;border-top:120px solid #FDEAE0;transform-origin:center 0;transform:perspective(700px) rotateX(0deg);transition:transform 1s cubic-bezier(.4,0,.2,1);z-index:3;backface-visibility:hidden;}
.li-flap-open{transform:perspective(700px) rotateX(-175deg)!important;}

.li-seal{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:62px;height:62px;background:radial-gradient(circle at 35% 35%,#F08090,#C03060);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;z-index:4;box-shadow:0 4px 16px rgba(180,40,80,.45),inset 0 2px 4px rgba(255,255,255,.35);border:3px solid rgba(255,255,255,.55);}

.li-hint{position:absolute;bottom:-44px;left:0;right:0;text-align:center;color:#A05070;font-size:14px;font-family:sans-serif;user-select:none;animation:liHint 2s ease-in-out infinite;}
@keyframes liHint{0%,100%{opacity:.6;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}

.li-letter{position:absolute;width:400px;max-width:92vw;background:#FFFAF8;border-radius:16px;padding:36px 32px 32px;box-shadow:0 32px 80px rgba(180,80,120,.28),0 0 0 1px rgba(220,150,170,.3);animation:liLetterIn .65s cubic-bezier(.34,1.56,.64,1) forwards;cursor:default;}
@keyframes liLetterIn{from{opacity:0;transform:translateY(60px) scale(.82)}to{opacity:1;transform:translateY(0) scale(1)}}
.li-letter-exit{animation:liLetterOut .5s ease forwards!important;}
@keyframes liLetterOut{to{opacity:0;transform:scale(1.06) translateY(-10px)}}

.li-deco{position:absolute;font-size:16px;opacity:.45;}
.li-tl{top:10px;left:12px}.li-tr{top:10px;right:12px}.li-bl{bottom:10px;left:12px}.li-br{bottom:10px;right:12px}

.li-inner{border:2px dashed #F0C0D0;border-radius:10px;padding:24px 20px;text-align:center;}
.li-orn{color:#D08098;font-size:13px;letter-spacing:6px;margin:6px 0;}
.li-title{font-size:22px;font-weight:700;color:#B03060;margin:12px 0 8px;font-family:Georgia,serif;line-height:1.4;}
.li-body{color:#7A4060;font-size:14px;line-height:1.9;margin:14px 0 10px;font-family:Georgia,serif;font-style:italic;}
.li-body strong{color:#C03060;font-style:normal;}
.li-ps{font-size:12px;color:#C06080;margin:10px 0 14px;font-style:italic;}
.li-sig{color:#A05070;font-size:14px;font-family:Georgia,serif;margin-bottom:22px;line-height:1.6;}
.li-sig em{font-size:18px;color:#C03060;font-weight:600;}
.li-btn{background:linear-gradient(135deg,#E8587A,#C03060);color:#fff;border:none;padding:13px 38px;border-radius:50px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 8px 24px rgba(200,50,90,.4);font-family:sans-serif;letter-spacing:.5px;}
.li-btn:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 14px 32px rgba(200,50,90,.5);}
.li-btn:active{transform:scale(.97);}
`;
