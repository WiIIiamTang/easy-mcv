/**
 * Get the age as a integer, from a date string
 */
 export const getAge = (date) => {
    var birthDate = new Date(date);
    var today = new Date();
    return Math.floor((today.getTime()-birthDate.getTime())/(1000*60*60*24*365.25));
}

/**
 * Counts and stores a certain category from the data into the global state.
 * It will count the occurrences of each type present in that category.
 * 
 * @param {Array} ediData the array of data rows read from the csv
 * @param {String} category the data attribute to count
 * @param {Array} state the global controller state
 * @param {String} state_keys_name the attribute name for the count when storing this count in the state
 */
export const counterKeys = (ediData, category, state, state_keys_name) => {
    var count = {};
    ediData.forEach((d) => {
        if (!count[d[category]]) {
            count[d[category]] = [];
            count[d[category]].push(d);
        } else {
            count[d[category]].push(d);
        }
    })
    state[state_keys_name] = Object.keys(count);
}