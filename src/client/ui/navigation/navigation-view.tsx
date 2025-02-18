import './navigation-view.scss'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface NavigationItemContextProps {
  depth: number
}

export interface NavigationContextProps {
  stack: NavigationStackItem[];
  push: (component: ReactNode) => void;
  pop: () => void;
  popAll: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);
const NavigationItemContext = createContext<NavigationItemContextProps | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const useNavigationItem = () => {
  const context = useContext(NavigationItemContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationItem');
  }
  return context;
}

export interface NavigationItemProps {
  title?: string;
  children: ReactNode;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ children }) => {
  return <>{children}</>;
};

export interface NavigationStackItem {
  component?: ReactNode;
}

export interface NavigationProviderProps {
  children?: React.ReactNode
  onClose?: () => void
  wrapper?: React.FC<{ children: React.ReactNode }>
  rootComponent?: React.ReactNode
}

export const NavigationProvider: React.FC<NavigationProviderProps> = (props) => {
  const [stack, setStack] = useState<NavigationStackItem[]>([]);

  const push = (component: ReactNode) => {
    setStack((prevStack) => {
      let newStackItem: NavigationStackItem = {
        component: (
          <NavigationItemContext.Provider value={{depth: stack.length}}>
            {props.wrapper ? <props.wrapper>{component}</props.wrapper> : component}
          </NavigationItemContext.Provider>
        )
      }

      return [
        ...prevStack,
        newStackItem as NavigationStackItem
      ]
    });
  };

  const pop = () => {
    if (stack.length == 1) {
      props.onClose?.()
      return
    }
    setStack((prevStack) => prevStack.slice(0, -1));
  };

  const popAll = () => {
    setStack([stack[0]]);
    props.onClose?.()
  }

  useEffect(() => {
    if (props.rootComponent) {
      push(props.rootComponent)
    }
    return () => popAll()
  }, [])

  return (
    <NavigationContext.Provider value={{ stack, push, pop, popAll }}>
      {props.children}
      {stack[stack.length - 1]?.component}
    </NavigationContext.Provider>
  );
};