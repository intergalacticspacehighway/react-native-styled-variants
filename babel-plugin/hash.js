//  The unique id generation code is taken from styled component's babel plugin repo
//  https://github.com/styled-components/babel-plugin-styled-components/blob/main/src/visitors/displayNameAndId.js

const path = require('path');
const fs = require('fs');
const FILE_HASH = 'styled-variants-file-hash';
const COMPONENT_POSITION = 'styled-variants-component-position';
const separatorRegExp = new RegExp(`\\${path.sep}`, 'g');
function getOption({ opts }, name, defaultValue = true) {
  return opts[name] === undefined || opts[name] === null
    ? defaultValue
    : opts[name];
}

const getNameSpace = (state) => {
  const namespace = getOption(state, 'namespace', '');
  if (namespace) {
    return `${namespace}__`;
  }
  return '';
};

/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @return {string} Base 36 encoded hash result
 */
function hash(str) {
  let l = str.length;
  let h = l;
  let i = 0;
  let k;

  while (l >= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    k ^= k >>> 24;
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);

    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k;

    l -= 4;
    ++i;
  } // forgive existing code

  /* eslint-disable no-fallthrough */ switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h =
        (h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  }
  /* eslint-enable no-fallthrough */

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  h ^= h >>> 15;

  return (h >>> 0).toString(36);
}

const findModuleRoot = (filename) => {
  if (!filename) {
    return null;
  }
  let dir = path.dirname(filename);
  if (fs.existsSync(path.join(dir, 'package.json'))) {
    return dir;
  } else if (dir !== filename) {
    return findModuleRoot(dir);
  } else {
    return null;
  }
};

const getFileHash = (state) => {
  const { file } = state;
  // hash calculation is costly due to fs operations, so we'll cache it per file.
  if (file.get(FILE_HASH)) {
    return file.get(FILE_HASH);
  }
  const filename = file.opts.filename;
  // find module root directory
  const moduleRoot = findModuleRoot(filename);
  const filePath =
    moduleRoot &&
    path.relative(moduleRoot, filename).replace(separatorRegExp, '/');
  const moduleName =
    moduleRoot &&
    JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'))).name;
  const code = file.code;

  const stuffToHash = [moduleName];

  if (filePath) {
    stuffToHash.push(filePath);
  } else {
    stuffToHash.push(code);
  }

  const fileHash = hash(stuffToHash.join(''));
  file.set(FILE_HASH, fileHash);
  return fileHash;
};

const getNextId = (state) => {
  const id = state.file.get(COMPONENT_POSITION) || 0;
  state.file.set(COMPONENT_POSITION, id + 1);
  return id;
};

const getComponentId = (state) => {
  if (!state) {
    return 'test';
  }
  // Prefix the identifier with a character because CSS classes cannot start with a number
  return `${getNameSpace(state)}sc${getFileHash(state)}${getNextId(
    state
  )}`.toLowerCase();
};

module.exports = { getComponentId };
