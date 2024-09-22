// store.js
import Framework7 from "framework7";;

const store = Framework7.createStore({
    state: {
        id: null,
        fileName: '',
        title: '',
        backdrop: '',
    },
    actions: {
        setData({ state }, { id, fileName, title, backdrop }) {
            state.id = id;
            state.fileName = fileName;
            state.title = title;
            state.backdrop = backdrop;
        }
    },
});

export default store;
