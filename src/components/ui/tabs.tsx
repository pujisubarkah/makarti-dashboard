import * as React from "react";

// value and onValueChange are provided via context, not used directly here
export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ className, children }: TabsProps) {
  return (
    <div className={className}>{children}</div>
  );
}

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={className} role="tablist">
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={
        `${className ?? ''} px-4 py-2 rounded transition font-semibold ` +
        (isActive
          ? 'bg-white text-blue-700 shadow border-b-2 border-blue-600'
          : 'bg-blue-100 text-blue-600 hover:bg-white')
      }
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (context.value !== value) return null;
  return <div className={className}>{children}</div>;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({
  value: '',
  onValueChange: () => {},
});

export function TabsProvider({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  );
}

// Wrapper to provide context automatically
export function TabsWithProvider(props: TabsProps) {
  return (
    <TabsProvider value={props.value} onValueChange={props.onValueChange}>
      <Tabs {...props} />
    </TabsProvider>
  );
}

// For compatibility with import { Tabs, TabsList, ... }
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
