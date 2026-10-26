import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { ASSETS_IMPORT_PREFIX, assetIdentifier, replaceAssetTokens } from './assets.ts';
import { WEB_ROOT } from './cli.ts';
import type { GeneratedModule } from './domain.ts';
import { ROUTE_TOKEN_PATTERN, assetIdsIn } from './tokens.ts';

export const renderModule = async (
  module: GeneratedModule,
  assetFiles: ReadonlyMap<string, string>,
) => {
  const body = module.exports
    .map(({ name, type, value }) => `export const ${name}: ${type} = ${JSON.stringify(value)};`)
    .join('\n\n');
  const assetImports = [...new Set(assetIdsIn(body))].sort().map((id) => {
    const fileName = assetFiles.get(id);
    if (!fileName) throw new Error(`Asset ${id} was referenced but not downloaded`);
    return `import ${assetIdentifier(id)} from '${ASSETS_IMPORT_PREFIX}/${fileName}';`;
  });
  const routeImports = body.includes('"@@route:')
    ? [`import { ROUTES } from '${module.routesFrom ?? '@/shared/config/routes'}';`]
    : [];
  const typeImports = module.typeImports.map(
    ({ from, names }) => `import type { ${names.join(', ')} } from '${from}';`,
  );

  const code = replaceAssetTokens(body).replace(
    ROUTE_TOKEN_PATTERN,
    (_, routeKey: string) => `ROUTES.${routeKey}`,
  );
  const source = [...typeImports, ...routeImports, ...assetImports, '', code, ''].join('\n');
  const filepath = path.join(WEB_ROOT, module.file);
  const options = await resolveConfig(filepath);
  return format(source, { ...options, filepath });
};
