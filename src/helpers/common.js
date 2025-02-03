/**
 * Returns a random number in the min max range
 * @param min
 * @param max
 * @returns {number}
 */
export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  /**
   * Create a safeid from a input (removes spaces , add - and lowercase)
   * @param string
   * @returns {string}
   */
  export const createSafeId = (string) => {
    return string.replace(/ /g, "-").toLowerCase();
  };
  
  /**
   * This removes empty object properties
   * @param object
   * @returns {{}}
   */
  export const objectEmptyFieldRemover = (object) => {
    const objectKeys = Object.keys(object);
    let newObjectWithoutEmptyKeys = {};
    for (let key of objectKeys) {
      if (object[key] !== null && object[key] !== "") {
        newObjectWithoutEmptyKeys[key] = object[key];
      }
    }
    return newObjectWithoutEmptyKeys;
  };
  
  /**
   * Create a Deep copy of the object
   * @param object
   * @returns {any}
   */
  export const deepCopy = (object) => {
    return JSON.parse(JSON.stringify(object));
  };
  
  /**
   * Create a object that can be used to fill data on FilterSelect
   * @param expanded => if the field is expanded or nto
   * @param label
   * @param selectedValues
   * @param values
   * @param multi => if multiple select is enabled
   * @returns {{expanded: boolean, values: [], label: string, multi: boolean}}
   */
  export const createFilterObject = (
    expanded = false,
    label = "",
    selectedValues = [],
    values = [],
    multi = false
  ) => {
    const valuesGenerator = () => {
      const valuesArray = [];
      for (let value of values) {
        if (selectedValues.includes(value)) {
          valuesArray.push({
            value: true,
            label: value
          });
        } else {
          valuesArray.push({
            value: false,
            label: value
          });
        }
      }
      return valuesArray;
    };
    return {
      expanded,
      label,
      multi,
      values: valuesGenerator()
    };
  };
  
  /**
   * Create a object that can be used to fill data on FilterSelect
   * @param expanded => if the field is expanded or nto
   * @param label
   * @param selectedValues
   * @param values
   * @param multi => if multiple select is enabled
   * @param constants_values
   * @returns {{expanded: boolean, values: [], label: string, multi: boolean, constants_values = {}}}
   */
  export const createFilterObjectForOrg = (
    expanded = false,
    label = "",
    selectedValues = [],
    values = [],
    multi = false,
    constants_values = {},
  ) => {
    const valuesGenerator = () => {
      const valuesArray = [];
      for (let value of values) {
        let valuePresent = true;
        valuePresent = selectedValues.includes(value) ? valuePresent : !valuePresent;
        valuesArray.push({
          value: valuePresent,
          label: value,
          name: constants_values[value]
        });
      }
      return valuesArray;
    };
    return {
      expanded,
      label,
      multi,
      values: valuesGenerator()
    };
  };
  
  /**
   * Returns the selected results of filterObject
   * @param filterObject
   * @returns {*|[]|null}
   */
  export const getValueOfFilterObject = (filterObject) => {
    if (filterObject == null) {
      return null;
    }
    const results = [];
    for (let value of filterObject.values) {
      if (value.value) {
        value.name ? results.push(value.name) : results.push(value.label);
      }
    }
    if (results.length === 0) {
      return null;
    }
    return (!filterObject.multi) ? results[0] : results;
  };
  
  export const booleanToString = (v) => {
    return v ? "true" : "false";
  };
  
  export const stringToBoolean = (v) => {
    if (v === null) {
      return null;
    }
    return v.toLowerCase() === "true";
  };
  
  export const waitForTime = (ms) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  };
  
  export const getStandardName = org => {
    let standardName = '';
    org.orgnames.forEach(orgname => {
      if (
        orgname.isstandardname &&
        orgname.languagecode === 'eng' &&
        orgname.scriptcode.toLowerCase() === 'latn'
      ) {
        standardName = orgname.value;
      }
    });
  
    return standardName;
  };
  
  export const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
  }
  
  export const getValueByKey = (object, key) => {
    return Object.values(object).find(value => object[key] === value);
  }
  