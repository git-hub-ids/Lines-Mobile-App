import * as React from 'react';
import * as lookups from "services/lookup";

export const AuthContext = React.createContext({
  status: 'idle',
  token: null,
  signIn: () => { },
  signOut: () => { },
});

export const useAuthorization = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('Error');
  }
  return context;
};

export const AuthProvider = props => {
  const [state, dispatch] = React.useReducer(reducer, {
    status: 'idle',
    token: null,
  });
  const actions = React.useMemo(
    () => ({
      signIn: async (token) => {
        global['token'] = token;
        var locations = await lookups.getLocations();
        if (locations && locations.length > 0) {
          global['locations'] = locations;
          if (locations.length == 1) {
            global["LocationId"] = locations[0].id;
            global["StepLocationId"] = locations[0].id;
            var steps = await lookups.getSteps(locations[0].id);
            if (steps && steps.length == 1)
              global['steps'] = steps;
          }
        }
        dispatch({ type: 'SIGN_IN', token });
      },
      signOut: async () => {
        global['token'] = null;
        dispatch({ type: 'SIGN_OUT' });
      },
    }),
    [state, dispatch],
  );
  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {props.children}
    </AuthContext.Provider>
  );
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'SIGN_OUT':
      return {
        ...state,
        status: 'signOut',
        token: null,
      };
    case 'SIGN_IN':
      return {
        ...state,
        status: 'signIn',
        token: action.token,
      };
  }
};