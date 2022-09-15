import * as React from 'react';
import RNRestart from 'react-native-restart';

export const AppContext = React.createContext({
  restart: () => { },
});

export const useAppProvider = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('Error');
  }
  return context;
};

export const AppProvider = props => {
  const [state, dispatch] = React.useReducer(reducer, {

  });
  const actions = React.useMemo(
    () => ({
      restart: async () => {
        RNRestart.Restart();
        dispatch({ type: 'RESTART' });
      },
    }),
    [state, dispatch],
  );
  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {props.children}
    </AppContext.Provider>
  );
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'RESTART':
      return {
        ...state,
      };
  }
};