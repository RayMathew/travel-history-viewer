import { createContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NotionData } from "@/lib/types/shared";
export const UserContext = createContext({});

export function UserProvider({ children }) {
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