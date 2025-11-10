import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MyFavPhoto API",
      version: "1.0.0",
      description: "8th MyFavPhoto 프로젝트를 위한 API 문서입니다.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "개발 서버",
      },
    ],
  },
  // API 주석이 포함된 파일 경로
  apis: ["./src/routes/*.js", "./src/app.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
