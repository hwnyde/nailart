"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const FRAG_SRC = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define S smoothstep
#define MN min(R.x,R.y)
float pattern(vec2 uv) {
  float d=.0;
  for (float i=.0; i<3.; i++) {
    uv.x+=sin(T*(1.+i)+uv.y*1.5)*.2;
    d+=.005/abs(uv.x);
  }
  return d;
}
vec3 scene(vec2 uv) {
  vec3 col=vec3(0);
  uv=vec2(atan(uv.x,uv.y)*2./6.28318,-log(length(uv))+T);
  for (float i=.0; i<3.; i++) {
    int k=int(mod(i,3.));
    col[k]+=pattern(uv+i*6./MN);
  }
  return col;
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  float s=12., e=9e-4;
  col+=e/(sin(uv.x*s)*cos(uv.y*s));
  uv.y+=R.x>R.y?.5:.5*(R.y/R.x);
  col+=scene(uv);
  O=vec4(col,1.);
}`;

const VERT_SRC = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
    if (!gl) return;

    const compileShader = (src: string, type: number) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compileShader(VERT_SRC, gl.VERTEX_SHADER);
    const fs = compileShader(FRAG_SRC, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return;
    }

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(prog);
    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "time");
    const uRes = gl.getUniformLocation(prog, "resolution");
    gl.clearColor(0, 0, 0, 1);

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
      const W = Math.floor(cssW * dpr);
      const H = Math.floor(cssH * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      gl.viewport(0, 0, W, H);
    };
    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    window.addEventListener("resize", fit);

    let raf: number;
    const loop = (now: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center font-montserrat">
      {/* Shader background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block select-none touch-none"
        aria-hidden="true"
      />

      {/* Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #00000099, #00000040 40%, transparent)",
        }}
      />

      {/* Back button */}
      <a
        href="/"
        className="absolute top-5 left-6 z-10 flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium no-underline transition-colors duration-200"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </a>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="rounded-2xl bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-[1.3] p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <a
              href="/"
              className="text-3xl font-bold text-white no-underline tracking-tight"
            >
              Nailart
            </a>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              AI로 클릭을 부르는 유튜브 썸네일을 만들어보세요.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Google sign-in button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-white text-[#1f1f1f] font-semibold text-[15px] cursor-pointer border-none shadow-[0_2px_12px_rgba(0,0,0,0.15)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {loading ? "로그인 중..." : "Google로 계속하기"}
          </button>

          {/* Terms */}
          <p className="mt-6 text-white/40 text-xs text-center leading-relaxed">
            계속 진행하면{" "}
            <a href="#" className="text-white/60 underline hover:text-white/80">
              서비스 약관
            </a>{" "}
            및{" "}
            <a href="#" className="text-white/60 underline hover:text-white/80">
              개인정보 처리방침
            </a>
            에 동의하는 것으로 간주합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
