import { getAge } from './util.js';

export const parse_csv_and_start_app = (path, state, row_annotator, updateApp) => {
    d3.csv(path).then((data) => {
        row_annotator(data, state)

        updateApp();
    })
}