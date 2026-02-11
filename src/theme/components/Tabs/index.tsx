import { useState, createContext, useContext } from 'react';

interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

export interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ 
  children, 
  defaultValue, 
  value, 
  onValueChange,
}: TabsProps) {
  const [selectedTab, setSelectedTabState] = useState(value ?? defaultValue ?? '');

  const setSelectedTab = (id: string) => {
    setSelectedTabState(id);
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className="my-6">{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, disabled }: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = useTabs();
  const isSelected = selectedTab === value;

  return (
    <button
      onClick={() => !disabled && setSelectedTab(value)}
      disabled={disabled}
      className={`
        px-4 py-2 text-sm font-medium transition-colors relative
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isSelected 
          ? 'text-indigo-600' 
          : 'text-gray-500 hover:text-gray-700'}
      `}
    >
      {children}
      {isSelected && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
      )}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({ value, children }: TabsContentProps) {
  const { selectedTab } = useTabs();
  
  if (selectedTab !== value) return null;
  
  return (
    <div className="pt-4">
      {children}
    </div>
  );
}
