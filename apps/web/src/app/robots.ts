import type { MetadataRoute } from "next";

/**
 * 랜딩·법적 고지·고객지원은 공개한다. 관리자 콘솔과 로그인은 검색에 노출하지 않는다
 * (인증으로 막혀 있어도 URL이 색인되면 존재 자체가 드러난다).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/login", "/api/"],
      },
    ],
  };
}
