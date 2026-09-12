export function generateVercelArtifacts(): Record<string, string> {
  return {
    "generated/vercel.json": JSON.stringify({ framework: "nextjs" }, null, 2) + "\n",
    "generated/.gitignore": ".next/\nnode_modules/\n.env\n.env.local\n.vercel/\n",
    "generated/.env.example": `# Persistencia remota opcional.\n# Si quedan vacías, MaestroArch usa localStorage automáticamente.\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\n`,
    "generated/DEPLOY.md": `# Deploy en Vercel\n\nEste proyecto fue generado para desplegarse directamente desde GitHub en Vercel.\n\n## Camino recomendado\n1. Publicar el contenido de \`generated/\` en el repositorio objetivo usando MaestroArch.\n2. Importar ese repositorio en Vercel.\n3. Framework preset: **Next.js**.\n4. Build command: \`npm run build\`.\n5. Configurar variables solo si el proyecto las documenta en \`.env.example\`.\n6. Verificar el build antes de promover a producción.\n\n## Persistencia\n- sin variables: localStorage, costo cero;\n- con \`NEXT_PUBLIC_SUPABASE_URL\` y \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: adapter Supabase REST;\n- ejecutar \`supabase/schema.sql\` antes de habilitar el modo remoto.\n\n## Seguridad\n- no subir \`.env\` ni \`.env.local\`;\n- usar variables de entorno de Vercel para configuración;\n- las policies demo de Supabase deben endurecerse antes de guardar datos sensibles;\n- mantener GitHub como fuente de verdad.\n`
  };
}
