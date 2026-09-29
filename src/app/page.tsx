"use client";

import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createTimeline, stagger, steps, type Timeline } from "animejs";
import { countdownClock } from "@/lib/clock-store";
import styles from "./page.module.css";
import Backdrop from "./Backdrop";
import Showcase from "./Showcase";

/**
 * 공개 랜딩 페이지.
 *
 * ⚠️ 여기 적는 것은 전부 **지금 동작하는 기능**이어야 한다. 2026-08-07 감사 시점에 이 페이지는
 * 삭제된 v1 기능(AI 에이전트가 대신 대화 / 가상 소셜 파티 / AI 호환성 리포트)을 광고하고 있었고,
 * 로그인 후에는 존재하지 않는 `/dashboard`로 보냈다. 기능을 지우면 이 문구도 같이 지운다.
 *
 * 디자인: 검정 바탕 + 흰 글자 + 핑크 강조 하나, 12열 격자(2026-09-28 Brut·HAUS 재설계).
 * 시각 규칙 = docs/design/LANDING_GESTALT.md §1. 스토어 URL이 생기면 배포 환경변수만 등록해
 * 사전 예약 아래에 다운로드 링크가 붙는다.
 */

// 오픈 목표일 — 자정(KST) 기준. 날짜가 바뀌면 이 두 상수만 고친다.
const OPEN_AT = new Date("2026-11-09T00:00:00+09:00").getTime();
const OPEN_LABEL = "2026.11.09";
/** "11월 9일" — 히어로 CTA·사전 예약 제목이 같이 쓴다(KST 기준, 날짜는 OPEN_AT 한 곳). */
const OPEN_KO = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
}).format(OPEN_AT);

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 카운트다운 상태 — 마운트 후에만 시계를 채워 SSR hydration 불일치를 피한다. */
function useCountdown() {
  const now = useSyncExternalStore(
    countdownClock.subscribe,
    countdownClock.getSnapshot,
    countdownClock.getServerSnapshot,
  );

  const diff = now === null ? null : Math.max(0, OPEN_AT - now);
  return {
    opened: diff !== null && diff === 0,
    days: diff === null ? "··" : pad2(Math.floor(diff / 86_400_000)),
    hours: diff === null ? "··" : pad2(Math.floor(diff / 3_600_000) % 24),
    minutes: diff === null ? "··" : pad2(Math.floor(diff / 60_000) % 60),
    seconds: diff === null ? "··" : pad2(Math.floor(diff / 1_000) % 60),
  };
}

/**
 * 페이지 헤더 — 워드마크 · D-day 카운트다운 · 사전 예약/문의(2026-09-23 히어로 시안 v2의 바를 그대로 채택).
 * 클래스 이름 `launchBar`는 유지한다: 히어로 띠 측정(`measureHeroBands`)이 이 요소의 높이를 읽는다.
 */
function LaunchCountdown() {
  const clock = useCountdown();
  return (
    <div className={styles.launchBar}>
      <a className={styles.barMark} href="#top" aria-label="MINGLES 맨 위로">
        MINGLES
      </a>
      {clock.opened ? (
        <p className={styles.barClock}>지금 오픈</p>
      ) : (
        // 초 단위 숫자를 스크린리더가 매초 읽지 않게 시각용은 숨기고 날짜만 남긴다.
        <p className={styles.barClock}>
          <span aria-hidden>
            <b>{clock.days}</b>D <b>{clock.hours}</b>:<b>{clock.minutes}</b>:<b>{clock.seconds}</b>
          </span>
          <span className={styles.visuallyHidden}>{`${OPEN_KO} 오픈까지 ${clock.days}일`}</span>
        </p>
      )}
      <div className={styles.barNav}>
        <TextLink href="#pre-register" primary>
          사전 예약
        </TextLink>
      </div>
    </div>
  );
}

/**
 * 섹션 배경(Backdrop.tsx, 스포트라이트) 사진 — 모두 Unsplash License(출처 표기 의무 없음), 2026-09-28 대표 지시:
 * 숫자 = 손잡은 커플 실루엣(photo-1566568307024) · 벤토 = 손을 잡고 이끄는 뒷모습(photo-1552848390, Showcase.tsx — 얼굴이
 * 보이지 않는 사진만, 대표 지시) ·
 * 사전 예약 = 배경 층 없음 — 1109 글자 상자에만 결 있는 벽 위 손 그림자 하트(photo-1753626636142, 대표가 고른 Unsplash+ 사진
 *   hT100fhAzMY는 유료라 결이 가장 비슷한 무료 사진으로 대체)를 하트 둘레만 가로로 잘라(`bg-heart-wall.webp`) 글자 크기에 맞춘다.
 */

type PreRegisterState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; email: string; already: boolean }
  | { phase: "error"; message: string };

/**
 * 사전 예약 — 이메일만 수집한다. 코드는 지금 보여주지 않고,
 * 오픈일에 예약된 이메일 전체로 한 달 무제한 코드를 일괄 발송한다.
 */
function PreRegisterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<PreRegisterState>({ phase: "idle" });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.phase === "loading") return;
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/pre-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadyRegistered?: boolean;
        message?: string | string[];
      };
      if (!res.ok || !body.ok) {
        const serverMessage = Array.isArray(body.message) ? body.message[0] : body.message;
        setState({
          phase: "error",
          message: serverMessage || "예약을 접수하지 못했습니다, 잠시 후 다시 시도해 주세요",
        });
        return;
      }
      setState({ phase: "done", email, already: Boolean(body.alreadyRegistered) });
    } catch {
      setState({ phase: "error", message: "네트워크 연결을 확인하고 다시 시도해 주세요" });
    }
  }

  return (
    <section className={styles.preRegister} id="pre-register" aria-labelledby="pre-register-title">
      <div className={styles.preInner}>
        {/* 히어로 워드마크와 짝 — 페이지를 같은 크기의 활자로 열고 닫는다(폐쇄·대칭). */}
        <p className={styles.preDate} aria-hidden>
          {OPEN_LABEL.slice(5).replace(".", "")}
        </p>
        <div className={styles.preCopy}>
          <span className={styles.featureKicker}>PRE-REGISTRATION</span>
          <h2 id="pre-register-title">{OPEN_KO}, 첫 밍글링</h2>
          <p>사전 예약 시, 한 달 무제한 코드를 메일로</p>
        </div>
        {state.phase === "done" ? (
          <div className={styles.ticket} role="group" aria-label="사전 예약 완료">
            <div className={styles.ticketStub} aria-hidden>
              <span>1 MONTH</span>
              <span>UNLIMITED</span>
            </div>
            <div className={styles.ticketBody}>
              <span className={styles.ticketKicker}>
                {state.already ? "이미 예약된 이메일" : "사전 예약 완료"}
              </span>
              <code className={styles.ticketCode}>{state.email}</code>
              <small>
                오픈일({OPEN_LABEL}), 이 주소로 한 달 무제한 이용 코드 발송 · 메일이 없으면 스팸함도
                확인해 주세요
              </small>
            </div>
          </div>
        ) : (
          <form className={styles.preForm} onSubmit={submit}>
            <label className={styles.visuallyHidden} htmlFor="pre-email">
              이메일 주소
            </label>
            <input
              id="pre-email"
              className={styles.preInput}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className={`${styles.textButton} ${styles.textButtonPrimary}`}
              type="submit"
              disabled={state.phase === "loading"}
            >
              {state.phase === "loading" ? "예약 중…" : "사전 예약"}
            </button>
            {state.phase === "error" ? (
              <p className={styles.preError} role="alert">
                {state.message}
              </p>
            ) : null}
          </form>
        )}
        {STORE_LINKS.apple || STORE_LINKS.google ? (
          <div className={styles.storeLinks}>
            {STORE_LINKS.apple ? (
              <TextLink href={STORE_LINKS.apple} external>
                App Store
              </TextLink>
            ) : null}
            {STORE_LINKS.google ? (
              <TextLink href={STORE_LINKS.google} external>
                Google Play
              </TextLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const STORE_LINKS: { google: string | null; apple: string | null } = {
  google: process.env.NEXT_PUBLIC_PLAY_STORE_URL || null,
  apple: process.env.NEXT_PUBLIC_APP_STORE_URL || null,
};

/**
 * 버튼 = 글자 + 밑줄 한 줄(2026-09-28 대표 지시: 알약·화살표 폐기, 텍스트만).
 * 채운 면이 없으니 강조는 색으로만 가른다 — primary는 핑크 글자, 나머지는 흰 글자.
 * 밑줄은 기본 40%로 깔리고, 올리면 왼쪽에서 오른쪽으로 꽉 찬 선이 덮는다.
 */
function TextLink({
  href,
  children,
  primary = false,
  external = false,
  className,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      className={[styles.textButton, primary ? styles.textButtonPrimary : "", className ?? ""].join(
        " ",
      )}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/**
 * 히어로 목차 = 아래 장면 순서 그대로 한 줄(2026-09-28 대표 지시). 누르면 그 장면으로 내려간다.
 * 장면을 더하거나 순서를 바꾸면 이 표와 섹션 id를 같이 바꾼다.
 */
const HERO_LINKS = [
  { href: "#rotation", name: "BLIND ROTATION MINGLING" },
  { href: "#table", name: "TABLE MINGLING" },
  { href: "#course", name: "DATE PLAN" },
  { href: "#daily", name: "DAILY QUESTION" },
  { href: "#meetups", name: "MEETUPS" },
] as const;

/**
 * 포맷 장면 = 두 모드를 숫자 넷씩으로. 위 절반은 로테이션(왼쪽에서 시작), 아래 절반은 테이블(오른쪽에서 시작).
 * 숫자는 서버와 같아야 한다 — 로테이션 `speed-date.config.ts`, 테이블은 가이드 프로그램 v2
 * `table-mingle.program.ts` `TABLE_GUIDED_PROGRAM`(4인 합계 2,100초 = 35분, 주제 3개, 선택 60초).
 * 앱 테이블 화면이 v2로 바뀌었다(2026-09-16). 운영 기본값은 아직 v1(`TABLE_MINGLE_PROGRAM_VERSION`)이라
 * v2 전환 전에 공개하면 이 줄이 실제와 어긋난다 — 전환 일정과 같이 본다.
 */
const FORMAT_ROWS = [
  {
    title: "BLIND ROTATION",
    facts: [
      { value: "3:3", unit: "PEOPLE", label: "본인·회사 인증을 마친 남녀 세 명씩" },
      { value: "5", unit: "MIN", label: "한 사람과 5분, 돌아가며 모두와" },
      { value: "3", unit: "STAGES", label: "블라인드, 목소리, 얼굴 순서의 공개" },
      { value: "10", unit: "SEC", label: "비공개 선택, 서로 고르면 1:1 채팅" },
    ],
  },
  {
    title: "TABLE MINGLING",
    facts: [
      { value: "2:2", unit: "PEOPLE", label: "여자 둘, 남자 둘이 한 테이블에" },
      { value: "35", unit: "MIN", label: "인사와 자기소개부터 이어가는 대화까지" },
      { value: "3", unit: "TOPICS", label: "나의 일상, 가까워지는 순간, 네 사람의 시선" },
      { value: "60", unit: "SEC", label: "다시 이야기하고 싶은 사람, 비공개 선택" },
    ],
  },
] as const;
const FORMAT_FACT_COUNT = FORMAT_ROWS.reduce((n, row) => n + row.facts.length, 0);

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const brandLetters = "MINGLES".split("");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const launchBar = root.querySelector<HTMLElement>(`.${styles.launchBar}`);
    const stages = [...root.querySelectorAll<HTMLElement>(`.${styles.featureStage}`)];
    const formatStage = root.querySelector<HTMLElement>(`.${styles.formatStage}`);
    const brand = root.querySelector<HTMLElement>(`.${styles.brand}`);
    const brandWord = root.querySelector<HTMLElement>(`.${styles.brandWord}`);
    const letters = root.querySelectorAll<HTMLElement>(`.${styles.brandLetter}`);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let intro: Timeline | null = null;

    // 워드마크 진입 — 컨테이너가 왼쪽에서 열리고 글자가 차례로 선다. 가짜 로딩 지연 없이 첫 페인트 직후.
    if (!reduceMotion.matches && brand && brandWord) {
      root.dataset.heroIntro = "running";
      intro = createTimeline({ autoplay: false })
        .add(brand, { width: ["0%", "100%"], duration: 1250, ease: "inOutQuart" }, 40)
        .add(
          letters,
          {
            "--letter-opacity": [0, 1],
            "--letter-y": ["38%", "0%"],
            "--letter-rotate": ["2deg", "0deg"],
            "--letter-blur": ["8px", "0px"],
            duration: 420,
            delay: stagger(46),
            ease: "outBack(1.35)",
          },
          180,
        )
        .add(
          brandWord,
          {
            keyframes: [
              { "--word-x": "3px", "--word-y": "-1px", duration: 45 },
              { "--word-x": "-2px", "--word-y": "1px", duration: 45 },
              { "--word-x": "0px", "--word-y": "0px", duration: 70 },
            ],
            ease: steps(2),
          },
          780,
        )
        .call(() => {
          root.dataset.heroIntro = "complete";
        }, 1280);
      intro.play();
    } else {
      root.dataset.heroIntro = "complete";
    }

    // 고정 헤더 높이 — 히어로·기능 장면의 상단 여백이 이 값을 쓴다(화면 높이를 따라 64~84px).
    // 리사이즈와 웹폰트 적용 때만 잰다 — 스크롤 프레임마다 재면 강제 레이아웃이 붙는다.
    const measureBar = () => {
      if (launchBar) {
        root.style.setProperty(
          "--hero-bar-h",
          `${launchBar.getBoundingClientRect().bottom.toFixed(1)}px`,
        );
      }
      // 모바일 워드마크 세로 배율 — 한 줄 글자(폭에 막힌 높이)를 화면 높이의 45%까지 늘린다(CSS가 scaleY로 쓴다).
      // 넓은 화면은 1(늘리지 않음). 상한 4 — 더 늘리면 획이 실처럼 가늘어 보인다.
      if (brand) {
        const lineHeight = parseFloat(getComputedStyle(brand).fontSize) * 0.96;
        const stretch =
          window.innerWidth <= 720
            ? Math.min(4, Math.max(1, (window.innerHeight * 0.45) / Math.max(1, lineHeight)))
            : 1;
        root.style.setProperty("--stretch", stretch.toFixed(3));
      }
    };
    measureBar();
    window.addEventListener("resize", measureBar);
    void document.fonts?.ready.then(measureBar);

    const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
    const easeIn = (value: number) => value * value;
    const easeOut = (value: number) => 1 - (1 - value) * (1 - value);

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = window.innerHeight;
        root.style.setProperty("--p", String(Math.min(1, window.scrollY / Math.max(1, vh))));

        // sticky 장면 하나의 진행도. **등장은 장면이 고정되기 전에 끝난다** — 고정된 뒤에 등장 구간이
        // 남으면 거기서 멈춘 사람에게 화면 한가운데가 흐린 채로 남는다(2026-09-10 결함).
        // 퇴장 easeIn·등장 easeOut, 퇴장 창을 fade의 20%만큼 뒤로 밀어 두 곡선이 ~0.14에서 만난다
        // (두 장면이 동시에 0.2를 넘거나 둘 다 0.1 아래인 프레임이 없다 — LANDING_GESTALT §1-6).
        const stageLead = vh * 0.3;
        const stageFade = vh * 0.2;
        const exitOverlap = stageFade * 0.2;
        const progressOf = (stage: HTMLElement) => {
          const rect = stage.getBoundingClientRect();
          const travel = Math.max(1, rect.height - vh);
          const pinned = -rect.top;
          const entry = easeOut(clamp01(1 - rect.top / stageLead));
          const exit = easeIn(
            clamp01((pinned - (travel - stageLead - stageFade + exitOverlap)) / stageFade),
          );
          // 마지막 sticky 장면은 다음이 문서 흐름(벤토)이라 퇴장 페이드 없이 그대로 올라간다.
          const last = stage === stages[stages.length - 1];
          return {
            visible: entry * (last ? 1 : 1 - exit),
            scroll: clamp01(pinned / travel),
            exitStart: (travel - stageLead - stageFade) / travel,
          };
        };
        for (const stage of stages) {
          stage.style.setProperty("--stage-p", progressOf(stage).visible.toFixed(3));
        }

        // 포맷 장면 — 숫자 네 개가 계단처럼 하나씩 선다. 고정 구간(퇴장 전)의 앞 70%에 다 서고
        // 나머지 30%는 네 개가 모두 선 채로 머문다 — 마지막 숫자가 퇴장과 겹쳐 흐리게만 지나갔다.
        if (formatStage) {
          const format = progressOf(formatStage);
          const steps = reduceMotion.matches
            ? FORMAT_FACT_COUNT
            : (format.scroll / (format.exitStart * 0.7)) * FORMAT_FACT_COUNT;
          formatStage.style.setProperty("--facts", Math.min(FORMAT_FACT_COUNT, steps).toFixed(3));
        }

      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", measureBar);
      if (raf) cancelAnimationFrame(raf);
      intro?.revert();
    };
  }, []);

  return (
    <div className={styles.page} ref={rootRef} id="top">
      <nav className={styles.siteHeader} aria-label="주요 메뉴">
        <LaunchCountdown />
      </nav>

      {/* 히어로: 장면 목차 한 줄 → 화면 폭 워드마크(아랫단이 잘린다). */}
      <header className={styles.hero}>
        <nav className={styles.heroGrid} aria-label="MINGLES 기능">
          {HERO_LINKS.map((item) => (
            <a key={item.href} href={item.href} className={styles.modeBlock}>
              {item.name}
            </a>
          ))}
        </nav>
        <div className={styles.brandBlock}>
          <h1 className={styles.brand} aria-label="MINGLES">
            <span className={styles.brandWord} aria-hidden>
              {brandLetters.map((letter, index) => (
                <span className={styles.brandLetter} key={`${letter}-${index}`}>
                  {letter}
                </span>
              ))}
            </span>
          </h1>
        </div>
      </header>

      {/* 포맷 — 위 절반 로테이션, 아래 절반 테이블(오른쪽부터). HAUS의 계단 숫자, 스크롤하면 위→아래로 하나씩 선다. */}
      <section
        className={`${styles.featureStage} ${styles.formatStage}`}
        aria-label="두 가지 밍글링 방식"
      >
        <div className={styles.featureSticky}>
          <Backdrop src="/bg-hands.webp" rest="br" />
          <div className={styles.formatPanel}>
            {FORMAT_ROWS.map((row, r) => (
              <div
                key={row.title}
                className={`${styles.formatRow} ${r === 1 ? styles.formatRowReverse : ""}`}
              >
                <h2 className={styles.formatTitle}>{row.title}</h2>
                <ol className={styles.formatFacts}>
                  {row.facts.map((fact, index) => (
                    <li
                      key={fact.unit}
                      style={
                        { "--i": r * row.facts.length + index, "--step": index } as CSSProperties
                      }
                    >
                      <span className={styles.factValue}>
                        {fact.value}
                        <small>{fact.unit}</small>
                      </span>
                      <span className={styles.factLabel}>{fact.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 01~05 = 벤토 한 장면(2026-09-28 대표 결정 B안). 캡처 비율 유지, 01 로테이션 큰 칸 + 02~05 2×2. */}
      <Showcase />

      <PreRegisterSection />

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} MINGLES</span>
      </footer>
    </div>
  );
}
