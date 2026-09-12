export function generateVercelArtifacts(): Record<string, string> {
  return {
    "generated/vercel.json": JSON.stringify({ framework: "nextjs" }, null, 2) + "\n",
    "generated/.gitignore": ".next/\nnode_modules/\n.env\n.env.local\n.vercel/\n",
    "generated/.env.example": "# Agregá aquí solo nombres de variables requeridas por el proyecto.\n# Nunca versiones secretos reales.\n",
    "generated/DEPLOY.md": `# Deploy en Vercel\n\nEste proyecto fue generado para desplegarse directamente desde GitHub en Vercel.\n\n## Camino recomendado\n1. Publicar el contenido de \`generated/\` en el repositorio objetivo usando MaestroArch.\n2. Importar ese repositorio en Vercel.\n3. Framework preset: **Next.js**.\n4. Build command: \`npm run build\`.\n5. No configurar variables salvo que el proyecto generado las documente en \`.env.example\`.\n6. Verificar el build antes de promover a producción.\n\n## Seguridad\n- no subir \`.env\` ni \`.env.local\`;\n- usar variables de entorno de Vercel para secretos;\n- mantener GitHub como fuente de verdad.\n`
  };
}
