import { useState } from "react";

export function useExtendedState<T>(initialState: T) {
    const [state, setState] = useState<T>(initialState);
    const getLatestState = () => {
        return new Promise<T>((resolve, reject) => {
            setState((s) => {
                resolve(s);
                return s;
            });
        });
    };

    return [state, setState, getLatestState] as const;
}
