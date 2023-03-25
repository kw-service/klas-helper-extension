import path from 'path';

const appDirectory = process.cwd();
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

interface Paths {
  appDev: string;
  appDist: string;
  appSrc: string;
  appExtMain: string;
}

const paths: Paths = {
  appDev: resolveApp('dev'),
  appDist: resolveApp('core'),
  appSrc: resolveApp('src'),
  appExtMain: resolveApp('src/main-ext.js')
};

export default paths;