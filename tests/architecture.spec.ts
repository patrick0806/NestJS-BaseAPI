import { readdirSync } from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Project Architecture', async () => {
  const srcPath = path.join(__dirname, '..', 'src');
  it('Validate project base structure', async () => {
    const projectBaseFolders = ['config', 'modules', 'shared'];
    const baseFiles = ['main.ts', 'app.module.ts'];
    const baseStructure = Array.from([...projectBaseFolders, ...baseFiles]);
    readdirSync(srcPath).filter((folder) => {
      expect(baseStructure).toContain(folder);
    });
  });

  it('Validate modules structure', async () => {
    const modules = readdirSync(path.join(srcPath, 'modules'));
    modules.forEach((module) => {
      const modulePath = path.join(srcPath, 'modules', module);
      const moduleFiles = readdirSync(modulePath);
      const moduleFile = moduleFiles.find((file) =>
        file.endsWith('.module.ts'),
      );
      const contextsPath = path.join(modulePath, 'contexts');
      const contextFolders = readdirSync(contextsPath);
      contextFolders.forEach((folder) => {
        const folderPath = path.join(contextsPath, folder);
        const folderFiles = readdirSync(folderPath);
        const serviceFile = folderFiles.find((file) =>
          file.endsWith('.service.ts'),
        );
        const controllerFile = folderFiles.find((file) =>
          file.endsWith('.controller.ts'),
        );
        expect(moduleFile).toBeTruthy();
        expect(serviceFile).toBeTruthy();
        expect(controllerFile).toBeTruthy();
      });
    });
  });
});
