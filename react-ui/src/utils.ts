import prixData from "./variables"
import { Message, Peer } from "./models";
import React from "react";

export const getHash = (to: string): string => {
    let me = prixData.me;

    if (to[0] === 'g') {
        return to;
    }

    let toId = 0;

    if (to[0] === '@') {
        to = to.substring(1);
        toId = parseInt(to);
    }

    if (me.id > toId) {
        return `${me.id}-${toId}`;
    }

    return `${toId}-${me.id}`;
}

export const isOnline = (peer: Peer): boolean => {
    if (!peer.last_seen) {
        return false;
    }

    return peer?.last_seen?.getTime() > Date.now() - 1000 * 60 * 3;
}

export function timeAgo(input?: string | Date): string {
    if (!input) {
        return 'offline';
    }

    const date = (input instanceof Date) ? input : new Date(input);

    const formatter = new Intl.RelativeTimeFormat(window.navigator.language, {
        style: 'short',
    });
    const ranges: {
        [key: string]: any,
    } = {
        years: 3600 * 24 * 365,
        months: 3600 * 24 * 30,
        weeks: 3600 * 24 * 7,
        days: 3600 * 24,
        hours: 3600,
        minutes: 60,
        seconds: 1
    };
    const secondsElapsed = (date.getTime() - Date.now()) / 1000;

    if (secondsElapsed > -60) {
        return 'online';
    }

    for (let key in ranges) {
        if (ranges[key] < Math.abs(secondsElapsed)) {
            const delta = secondsElapsed / ranges[key];
            return formatter.format(Math.round(delta), key as any);
        }
    }

    return '';
}


export const debounce = (n: number, fn: (...params: any[]) => any, immed: boolean = false) => {
    let timer: number | undefined = undefined;
    return function (this: any, ...args: any[]) {
        if (timer === undefined && immed) {
            fn.apply(this, args);
        }
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), n);
        return timer;
    }
};

export const throttle = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    const now = () => new Date().getTime()
    const resetStartTime = () => startTime = now()
    let timeout: number
    let startTime: number = now() - waitFor

    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise((resolve) => {
            const timeLeft = (startTime + waitFor) - now()
            if (timeout) {
                clearTimeout(timeout)
            }
            if (startTime + waitFor <= now()) {
                resetStartTime()
                resolve(func(...args))
            } else {
                timeout = setTimeout(() => {
                    resetStartTime()
                    resolve(func(...args))
                }, timeLeft)
            }
        })
}

export const mergeById = (a1: Message[], a2: Message[]) => {
    let map = new Map();

    a1.forEach((m1) => {
        map.set(m1.id, m1);
    });

    a2.forEach((m2) => {
        map.set(m2.id, m2);
    });

    return Array.from(map.values())
        .sort((a, b) => a.id - b.id);
};

declare var wp: {
    i18n: any
};

export const i18n = wp.i18n;
