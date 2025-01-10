import { createContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NotionData } from "@/lib/types/shared";
import { UserContextType } from '@/lib/types/frontend';

export const UserContext = createContext<UserContextType>({
    userName: '',
    unitOfDistance: 'km',
    setUnitOfDistance: () => { },
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState('');
    const [unitOfDistance, setUnitOfDistance] = useState<NotionData["distanceUnit"]>('km');

    const { data } = useSession();
    useEffect(() => {
        if (data?.user?.name) {
            setUserName(data.user.name);
        }
    }, [data]);

    return (
        <UserContext.Provider value={{
            userName,
            unitOfDistance,
            setUnitOfDistance
        }}>
            {children}
        </UserContext.Provider>
    );
}