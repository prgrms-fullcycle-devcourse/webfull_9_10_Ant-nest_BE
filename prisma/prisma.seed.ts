import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 표준 질문 시딩(Seeding) 시작...");

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
  ];

  for (const content of questions) {
    await prisma.standardQuestion.create({
      data: { content },
    });
  }

  console.log(
    `✅ 시딩 완료! 총 ${questions.length}개의 질문이 등록되었습니다.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
