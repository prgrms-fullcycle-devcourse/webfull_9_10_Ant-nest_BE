import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 데이터베이스 초기화 및 시퀀스 리셋 시작...");

  // 삭제 및 초기화 순서 (외래키 제약 조건 고려)
  const tableNames = [
    "empathy_record",
    "empathy_type",
    "square_post",
    "diary_photo",
    "diary",
    "standard_question",
    "member",
  ];

  for (const tableName of tableNames) {
    // RESTART IDENTITY를 통해 ID를 1번부터 다시 시작하게 함
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
    );
  }

  // 1. 표준 질문 시딩 (30개)
  console.log("🌱 표준 질문(30개) 시딩 중...");
  const questions = [
    "오늘 하루 중 가장 크게 웃었던 순간은 언제인가요?",
    "오늘 먹은 음식 중 가장 만족스러웠던 메뉴와 그 이유는 무엇인가요?",
    "오늘 계획했던 일들 중 가장 보람차게 마무리한 일은 무엇인가요?",
    "길을 걷다 마주친 풍경이나 사람 중 유독 기억에 남는 장면이 있나요?",
    "지금 이 순간, 고생한 나에게 해주고 싶은 가장 따뜻한 칭찬은?",
    "오늘 하루 중 가장 평온하고 여유로웠던 시간은 언제였나요?",
    "오늘 나를 조금 지치게 했던 일이 있었다면, 마음속으로 어떻게 다독였나요?",
    "오늘 새롭게 깨닫거나 배우게 된 사소한 삶의 지혜가 있나요?",
    "오늘 하루를 색깔로 표현한다면 어떤 색이며, 그 이유는 무엇인가요?",
    "내일의 나를 위해 오늘 밤 꼭 해주고 싶은 배려나 준비가 있나요?",
    "오늘 하루를 노래 제목으로 붙인다면 무엇인가요?",
    "오늘 나를 가장 설레게 했던 소식이나 계획이 있었나요?",
    "오늘 하루 동안 가장 많이 생각난 사람은 누구인가요?",
    "평소보다 조금 더 용기를 냈던 순간이 있었나요?",
    "오늘 마주친 소리 중 가장 기억에 남는 것은 무엇인가요? (빗소리, 웃음소리 등)",
    "오늘 내가 발견한 '나의 의외의 모습'이 있다면 무엇인가요?",
    "오늘 누군가에게 전하고 싶었지만 마음속에만 담아둔 말이 있나요?",
    "오늘 하루 중 무언가에 가장 깊이 몰입했던 시간은 언제였나요?",
    "오늘 내 몸의 컨디션은 어땠나요? 고생한 몸에게 다정한 한마디를 건네주세요.",
    "오늘 하루 중 가장 '나다웠던' 순간은 언제였나요?",
    "오늘 나를 기분 좋게 만든 향기나 냄새가 있었나요?",
    "오늘 하루 동안 가장 소중하게 느껴졌던 물건은 무엇인가요?",
    "오늘 실수했던 일이 있었다면, 그 일을 통해 나중에 무엇을 얻게 될까요?",
    "오늘 다른 사람에게 베푼 작은 친절이나 배려가 있었나요?",
    "오늘 타인에게 받은 호의 중 가장 마음이 따뜻해졌던 순간은 언제인가요?",
    "오늘 하루 중 가장 아쉬웠던 순간을 딱 하나만 골라본다면?",
    "오늘 나를 가장 편안하게 숨 쉬게 해준 장소는 어디였나요?",
    "최근 들어 나를 가장 미소 짓게 만드는 사소한 습관은 무엇인가요?",
    "내일 아침에 눈을 떴을 때, 어떤 기분으로 하루를 시작하고 싶나요?",
    "1년 뒤의 내가 오늘의 이 일기를 읽는다면 어떤 말을 해주고 싶을까요?",
  ];

  for (const content of questions) {
    await prisma.standardQuestion.create({ data: { content } });
  }

  // 2. 공감 종류 시딩 (5종 - 이름만 저장)
  console.log("🌸 광장 공감 종류(5종) 시딩 중...");
  const empathyTypes = [
    { name: "화남" }, // ID: 1
    { name: "설렘" }, // ID: 2
    { name: "신남" }, // ID: 3
    { name: "황당" }, // ID: 4
    { name: "슬픔" }, // ID: 5
  ];

  for (const type of empathyTypes) {
    await prisma.empathyType.create({ data: type });
  }

  console.log("✅ 모든 초기화 및 시딩이 완료되었습니다!");
  console.log("📊 등록된 질문 수:", questions.length);
  console.log("🌸 등록된 공감 종류:", empathyTypes.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
