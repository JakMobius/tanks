import './navigation-view.scss'

import View from "../view";
import Controller from "../controller/controller";
import NavigationTransition from "./navigation-transition";
import NavigationBlock from "./navigation-block";
import { Constructor } from "src/utils/constructor"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface NavigationItemContextProps {
  title?: string;
  onPop?: () => void;
  configured: boolean;
}

export interface NavigationContextProps {
  stack: NavigationStackItem[];
  push: (component: ReactNode) => void;
  pop: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);
const NavigationItemContext = createContext<NavigationItemContextProps | undefined>(undefined);

export interface NavigationItemProps {
  title: string;
  onPush?: () => void;
  onPop?: () => void;
  children: ReactNode;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ children, title, onPush, onPop }) => {
  const context = useContext(NavigationItemContext)

  if(!context.configured) {
    context.title = title
    context.onPop = onPop
    onPush?.()
  }

  return <>{children}</>;
};

export interface NavigationStackItem {
  component?: ReactNode;
  context: NavigationItemContextProps
}

export interface NavigationProviderProps {
  children: React.ReactNode
  onClose?: () => void
  wrapper?: React.FC<{ children: React.ReactNode }>
}

export const NavigationProvider: React.FC<NavigationProviderProps> = (props) => {
  const [stack, setStack] = useState<NavigationStackItem[]>([]);

  const push = (component: ReactNode) => {

    let newStackItem: NavigationStackItem = {
      context: {
        configured: false
      }
    }

    newStackItem.component = (
      <NavigationItemContext.Provider value={newStackItem.context}>
        {props.wrapper ? <props.wrapper>{component}</props.wrapper> : component}
      </NavigationItemContext.Provider>
    )

    setStack((prevStack) => [
      ...prevStack,
      newStackItem as NavigationStackItem
    ]);
  };

  const pop = () => {
    stack[stack.length - 1].context.onPop?.();
    setStack((prevStack) => prevStack.slice(0, -1));
    if (stack.length == 1) {
      props.onClose?.()
    }
  };

  useEffect(() => {
    push(props.children)
    return () => {
      for (let i = stack.length - 1; i >= 0; i--) {
        stack[i].context.onPop?.()
      }
    }
  }, [])

  return (
    <NavigationContext.Provider value={{ stack, push, pop }}>
      {stack[stack.length - 1]?.component}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default class BasicNavigationView extends View {

  blockClass: Constructor<NavigationBlock> = NavigationBlock
  stack: NavigationBlock[] = []
  transitionStack: NavigationTransition[] = []
  locked: boolean

  constructor() {
    super();
    this.element.addClass("navigation-view")
  }

  pushController(controller: Controller, transition?: NavigationTransition): boolean {
    if (this.locked) return false

    controller.setNavigationView(this)

    const currentBlock = this.stack[this.stack.length - 1]
    const newBlock = new this.blockClass(controller)

    if (currentBlock) currentBlock.controller.onBlur()

    this.stack.push(newBlock)

    newBlock.onPush()

    if (transition) {
      this.locked = true
      this.transitionStack.push(transition)
      transition.performForwardTransition(this, currentBlock, newBlock, () => {
        this.locked = false
        newBlock.controller.onFocus()
      })
    } else {
      this.transitionStack.push(null)
      this.performDefaultTransition(currentBlock, newBlock)
      newBlock.controller.onFocus()
      this.locked = false
    }

    return true
  }

  popController(which: Controller | null = null): boolean {
    if (this.locked) return false

    if (which) {
      const index = this.stack.findIndex(b => b.controller === which)
      // Cannot pop root view controller as well as absent view controller
      if (index < 1) return false
    }

    if (this.stack.length <= 1) {
      return false
    }

    const currentBlock = this.stack[this.stack.length - 1]
    if (currentBlock) currentBlock.controller.onBlur()

    this.locked = true

    this.transitionToController(which).then(() => {
      this.locked = false
      const newBlock = this.stack[this.stack.length - 1]
      if (newBlock) newBlock.controller.onFocus()
    })

    return true
  }

  private async transitionToController(which: Controller | null) {
    while (true) {
      let poppedController = this.stack[this.stack.length - 1].controller
      await this.transitionToPreviousController()
      if (poppedController == which || !which) return
    }
  }

  private transitionToPreviousController(): Promise<void> {
    return new Promise<void>(resolve => {
      const currentBlock = this.stack.pop()
      const newBlock = this.stack[this.stack.length - 1]

      let transition = this.transitionStack.pop()
      if (transition) {
        transition.performBackwardTransition(this, currentBlock, newBlock, () => {
          resolve()
        })
      } else {
        this.performDefaultTransition(currentBlock, newBlock)
        resolve()
      }
    })
  }

  private performDefaultTransition(oldBlock: NavigationBlock, newBlock: NavigationBlock) {
    if (oldBlock) oldBlock.element.detach()
    if (newBlock) this.element.append(newBlock.element)
  }
}

