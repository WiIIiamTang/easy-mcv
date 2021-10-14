import { parse_csv_and_start_app } from "./data_parser.js";

const start_mcv_controller = (lang, initial_state, views, row_annotator, path) => {
    const state = {...initial_state, first_load: true, data: []};

    const filterData = () => {
        return state.data.filter((d) => {
            let filter_res = true;

            views.forEach((v) => {
                if (v.filter(d, state)) {
                    filter_res = false;
                }
            });

            return filter_res;
        })
    }

    const wrangleData = (filtered) => {
        views.forEach((v) => {
            v.wrangled_data = v.wrangle(filtered);
        });
    };

    const updateApp = () => {
        console.log('updating graphs');
        console.log(state.data.length);
        const filtered = filterData();
        wrangleData(filtered);
        views.forEach((v) => {
            console.log(v);
            v.update(v.wrangled_data, lang);
        })
    }

    views.forEach((v) => {
        v.update = v._fn(v.svgSelector, v.stateAttr, v.colorScheme, v.name_en, v.name_fr, state, updateApp); 
    });

    parse_csv_and_start_app(path, state, row_annotator, updateApp);

    return { state, updateApp };
};

export default start_mcv_controller;