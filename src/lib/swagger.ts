import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Ghorer Khabar API",
        version: "1.0.0",
      },
    },
    apiFolder: "src/app/api",
  });
  return spec;
};
