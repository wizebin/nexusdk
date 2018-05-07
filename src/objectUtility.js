/* eslint no-prototype-builtins: "off" */
export function set(object, path, value) {
  let subObject = object;
  const keys = getObjectPath(path || '');
  for (let keydex = 0; keydex < keys.length; keydex += 1) {
    let key = keys[keydex];
    if (key !== '') {
      if (key[key.length - 1] === ']') {
        key = key.substr(0, key.length - 1);
        key = parseInt(key, 10);
      }
      if (keydex !== keys.length - 1) {
        if (typeof subObject[key] !== 'object') {
          subObject[key] = {};
        }
        subObject = subObject[key];
      } else {
        subObject[key] = value;
      }
    }
  }

  return object;
}

export function has(object, key) {
  if (typeof object === 'object') {
    return (object.hasOwnProperty(key));
  }
  return false;
}

export function get(object, path, defaultValue = undefined) {
  let subObject = object;
  const keys = getObjectPath(path || '');
  for (let keydex = 0; keydex < keys.length; keydex += 1) {
    let key = keys[keydex];
    if (key !== '') {
      if (key[key.length - 1] === ']') {
        key = key.substr(0, key.length - 1);
        key = parseInt(key, 10);
      }

      if (!has(subObject, key)) return defaultValue;

      subObject = subObject[key];
    }
  }

  return subObject;
}

export function setKey(object, path, key, value) {
  if (path === null || path === undefined || path === '') {
    path = key;
  } else {
    path += `.${key}`;
  }
  return set(object, path, value);
}

export function setWithSubkey(object, path, subkey, value) {
  let subObject = object;
  (path || '').split('.').forEach((key, dex, ray) => {
    if (key !== '' && dex !== ray.length - 1) {
      if (subObject[subkey] === undefined) {
        subObject[subkey] = { [key]: {  } };
      }
      subObject = subObject[subkey][key];
    } else {
      if (subObject[subkey] === undefined) {
        subObject[subkey] = { [key]: {  } };
      }
      subObject[subkey][key] = value;
    }
  });

  return object;
}

export function setKeyWithSubkey(object, path, subkey, key, value) {
  if (path === null || path === undefined || path === '') {
    path = key;
  } else {
    path += `.${key}`;
  }
  return setWithSubkey(object, path, subkey, value);
}

export function getObjectPath(path) {
  if (path instanceof Array) return path;
  let inBrackets = false;
  let partBegin = 0;
  let split = false;
  let exitBrackets = false;
  const pathlen = path.length;
  const parts = [];

  for(let dex = 0; dex < pathlen + 1; dex += 1) {
    const char = path[dex];
    if (inBrackets && !exitBrackets) {
      if (char === ']') {
        exitBrackets = true;
      }
    } else if (char === '.') {
      split = true;
    } else if (char === '[') {
      split = true;
      inBrackets = true;
    }

    if (split || dex === pathlen) {
      let nextPart = path.substr(partBegin, dex - partBegin - (exitBrackets ? 1 : 0))
      if (inBrackets) {
        const parsed = parseInt(nextPart, 10);
        if (!isNaN(parsed)) {
          nextPart = parsed;
        }
      }
      parts.push(nextPart);
      partBegin = dex + 1;
      split = false;
      if (exitBrackets) inBrackets = false;
      exitBrackets = false;
    }
  }
  return parts;
}

export function getStringPathForArray(arrayPath) {
  return arrayPath.reduce((result, item, dex) => {
    if (toString.call(item) === '[object Number]') {
      return `${result}[${item}]`;
    }
    return result + (dex > 0 ? '.': '') + item;
  }, '');
}

export function assurePathExists(object, path, defaultValue = {}) {
  const arrayPath = getObjectPath(path);
  let currentObject = object;
  for (let arraydex = 0; arraydex < arrayPath.length; arraydex += 1) {
    const key = arrayPath[arraydex];
    if (!has(currentObject, key)) { // TODO: Address problems where key exists already and is not an array or object
      const nextKey = ((arraydex === arrayPath.length - 1) ? null : arrayPath[arraydex + 1]);
      if (nextKey === null) {
        currentObject[key] = defaultValue;
      } else if (toString.call(nextKey) === '[object Number]') {
        currentObject[key] = [];
      } else {
        currentObject[key] = {};
      }
    }
    currentObject = currentObject[key];
  }
  return currentObject;
}
