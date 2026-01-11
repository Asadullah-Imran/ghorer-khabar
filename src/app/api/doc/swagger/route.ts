import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

export async function GET() {
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Ghorer Khabar API',
        version: '1.0.0',
      },
    },
     apiFolder: 'src/app/api',
  });
  return NextResponse.json(spec);
}
