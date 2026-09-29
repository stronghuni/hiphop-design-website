"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import styles from "./showcase.module.css";
import Backdrop from "./Backdrop";

/**
 * 01~05 장면 = 벤토 한 화면(2026-09-28 대표 결정 — 5열·가로 필름 시안과 비교해 B안).
 * 캡처는 전부 실앱 캡처(1206×2622)이고 자르지 않는다 — 칸 높이에 원래 비율로 맞추고 남는 폭을 이름·한 줄이 채운다.
 * 칸 id(`rotation`·`table`·`course`·`daily`·`meetups`)는 히어로 목차 `HERO_LINKS`(page.tsx)와 짝이다.
 */

const ROTATION = [
  { src: "/app-screens/rotation-lobby.png", alt: "대기방: 정각까지 남은 시간과 진행 방식을 보여주는 MINGLES 대기 화면" },
  { src: "/app-screens/rotation-disguised.png", alt: "1단계 블라인드: 아바타와 변조된 목소리로 대화하는 MINGLES 로테이션 화면" },
  { src: "/app-screens/rotation-choice.png", alt: "비공개 선택: 세 사람 중 마음에 든 상대를 고르는 MINGLES 선택 화면" },
  { src: "/app-screens/rotation-match.png", alt: "매치: 서로 골라 1:1 채팅이 열린 MINGLES 결과 화면" },
];

const SCENES = [
  {
    id: "rotation",
    name: "BLIND ROTATION MINGLING",
    line: "로테이션 소개팅을 집에서",
    desc: "정각, 남녀 세 명씩 한자리에 · 한 사람과 5분씩 돌아가며 나누는 대화, 얼굴은 마지막 단계에서 공개",
    shots: ROTATION,
  },
  {
    id: "table",
    name: "TABLE MINGLING",
    line: "혼자가 힘들다면 넷이 함께",
    desc: "여자 둘, 남자 둘 · 순서와 주제는 앱이 이끄는 35분, 처음 만나도 어색할 틈 없는 한 테이블",
    shots: [
      { src: "/app-screens/table-intro.png", alt: "넷이 2×2 화면에서 한 사람씩 자기소개하는 MINGLES 테이블 밍글링 화면" },
      { src: "/app-screens/table.png", alt: "남녀 넷이 2×2 화면으로 앉아 주말에 하고 싶은 일을 고르는 MINGLES 테이블 밍글링 화면" },
    ],
  },
  {
    id: "course",
    name: "DATE PLAN",
    line: "다음 약속, 코스까지",
    desc: "동네, 시간대, 취향, 이동 수단 · 네 가지만 고르면 리뷰 좋은 실제 장소로 엮은 한 코스",
    // 02~05도 두 장씩 로테이션처럼 번갈아 넘어간다(대표 지시 2026-09-28: 결과·상세 화면도 보여 준다).
    shots: [
      { src: "/app-screens/course.png", alt: "지역과 시간대, 취향을 고르는 MINGLES 데이트 코스 추천 화면" },
      {
        src: "/app-screens/course-result.png",
        alt: "성수동 카페와 서울숲을 도보 18분 경로로 이은 MINGLES 추천 데이트 코스 결과 화면",
      },
    ],
  },
  {
    id: "daily",
    name: "DAILY QUESTION",
    line: "답하는 순간 열리는 다섯 사람",
    desc: "매일 바뀌는 질문 하나 · 답하면 흐리게 가려져 있던 다섯 사람의 응답이 선명하게, 마음에 드는 답에는 한마디",
    shots: [
      { src: "/app-screens/daily-question.png", alt: "오늘의 질문과 응답 칸, 흐리게 가려진 다섯 사람이 보이는 MINGLES 오늘의 질문 화면" },
      { src: "/app-screens/daily-question-open.png", alt: "내 응답 아래 다섯 사람의 응답이 열린 MINGLES 오늘의 질문 화면" },
    ],
  },
  {
    id: "meetups",
    name: "MEETUPS",
    line: "직접 여는 모임, 같이 갈 사람 모집",
    desc: "러닝, 와인, 보드게임, 전시 · 날짜와 동네를 정해 글을 올리면 같이 갈 사람이 찾아오는 모임 게시판, 연락은 오픈채팅으로",
    shots: [
      { src: "/app-screens/meetups.png", alt: "회원이 올린 모임 글이 종류별로 보이는 MINGLES 모임 탭 화면" },
      { src: "/app-screens/meetup-detail.png", alt: "성수 퇴근 후 와인 모임의 일시·장소·정원·소개가 보이는 MINGLES 모임 글 화면" },
    ],
  },
] as const;

/** 로테이션 4장을 번갈아 보여 주는 인덱스(2.5초). 동작 줄이기면 첫 장에 멈춘다. */
function useCycle(length: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % length), 2500);
    return () => window.clearInterval(t);
  }, [length]);
  return i;
}

function Shot({ src, alt, active = true, sizes }: { src: string; alt: string; active?: boolean; sizes: string }) {
  return (
    <Image
      className={`${styles.shot} ${active ? styles.shotActive : ""}`}
      src={src}
      alt={active ? alt : ""}
      width={1206}
      height={2622}
      sizes={sizes}
    />
  );
}

function Frames({ shots, cycle, sizes }: { shots: readonly { src: string; alt: string }[]; cycle: number; sizes: string }) {
  return (
    <>
      {shots.map((s, i) => (
        <Shot key={s.src} src={s.src} alt={s.alt} active={i === cycle % shots.length} sizes={sizes} />
      ))}
    </>
  );
}

function Caption({ scene }: { scene: (typeof SCENES)[number] }) {
  return (
    <div className={styles.caption}>
      <span className={styles.name}>{scene.name}</span>
      <span className={styles.line}>{scene.line}</span>
    </div>
  );
}

/**
 * 왼쪽 큰 칸 = 고른 장면(캡처 + 이름·한 줄), 오른쪽 = 나머지 넷의 캡처만 위아래 지그재그 한 줄(2026-09-28 대표 지시).
 * 오른쪽 캡처를 누르면 그 장면이 왼쪽 큰 칸으로 옮겨 가고, 나머지는 원래 순서로 오른쪽에 선다.
 * 히어로 목차(`#rotation` 등 칸 id로 가는 링크)를 눌러도 같은 일이 일어나고 벤토로 스크롤한다.
 * 자리 이동은 브라우저 View Transition으로 미끄러진다(지원 안 하면·동작 줄이기면 바로 바뀐다).
 */
export default function Showcase() {
  const cycle = useCycle(ROTATION.length);
  const [featured, setFeatured] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const feature = (index: number) => {
    const apply = () => flushSync(() => setFeatured(index));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) document.startViewTransition(apply);
    else apply();
  };

  // 모바일은 칸이 한 줄로 쌓여 "큰 칸" = 맨 위 칸이다 — 아래 칸을 누르면 바뀐 자리로 올라가 보여 준다.
  const featureAndReveal = (index: number) => {
    feature(index);
    if (window.matchMedia("(max-width: 720px)").matches) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 히어로 목차 — 칸 id로 가는 링크를 가로채 그 장면을 큰 칸에 올리고 벤토 맨 위로 스크롤한다.
  // 기본 앵커 이동을 두면 옮겨 가기 전 칸 위치로 스크롤해 버린다.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      const index = SCENES.findIndex((scene) => link?.getAttribute("href") === `#${scene.id}`);
      if (index < 0) return;
      event.preventDefault();
      feature(index);
      history.replaceState(null, "", `#${SCENES[index].id}`);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const big = SCENES[featured];
  const rest = SCENES.map((_, i) => i).filter((i) => i !== featured);
  return (
    <section ref={sectionRef} className={styles.bento} aria-label="MINGLES 기능">
      <Backdrop src="/bg-hands-lead.webp" rest="tl" />
      {/* 왼쪽 큰 칸 = 지금 고른 장면(캡처 + 이름·한 줄). */}
      <article id={big.id} className={styles.tileLarge} style={{ viewTransitionName: `tile-${big.id}` }}>
        <div className={styles.tileMedia} role="img" aria-label={big.shots[cycle % big.shots.length].alt}>
          <Frames shots={big.shots} cycle={cycle} sizes="30vw" />
        </div>
        <div className={styles.largeText}>
          {/* 기능 설명 — 글자 자리의 세로 가운데. 이름·한 줄은 그대로 아래에 둔다(대표 지시). */}
          <p className={styles.desc}>{big.desc}</p>
          <Caption scene={big} />
        </div>
      </article>
      {/* 오른쪽 = 나머지 넷의 캡처만, 캡처 크기에 맞춘 4×2 칸에 위·아래·위·아래(2026-09-28 대표 지시). 누르면 큰 칸으로 옮겨 간다. */}
      <div className={styles.rail}>
        {rest.map((index) => {
          const scene = SCENES[index];
          return (
            <button
              key={scene.id}
              id={scene.id}
              type="button"
              className={styles.railItem}
              style={{ viewTransitionName: `tile-${scene.id}` }}
              aria-label={`${scene.name} 크게 보기`}
              onClick={() => featureAndReveal(index)}
            >
              <span className={styles.tileMedia}>
                <Frames shots={scene.shots} cycle={cycle} sizes="15vw" />
              </span>
              {/* 무슨 화면인지 영문 이름만(한 줄 문구 없음) — 위 칸 캡처는 위쪽, 아래 칸 캡처는 아래쪽 바깥에 붙는다. */}
              <span className={styles.railLabel} aria-hidden>
                {scene.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
