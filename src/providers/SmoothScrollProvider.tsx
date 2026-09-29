"use client";
/*
 Lenis smooth scrolling, scoped to the public pages. Mounted from
 app/(public)/layout.tsx so the dashboard keeps native scrolling.

 The Lenis instance is published on context so anchor links (navbar)
 can route through lenis.scrollTo instead of jumping natively.
*/

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

type SmoothScrollContextValue = {
	lenis: Lenis | null;
	scrollTo: (target: string | HTMLElement) => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
	lenis: null,
	scrollTo: () => {},
});

export function useSmoothScroll() {
	return useContext(SmoothScrollContext);
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
	// Held in a ref, not state: Lenis is an external system, and writing to a
	// ref during the effect avoids a cascading re-render on mount.
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const instance = new Lenis();
		instance.on("scroll", ScrollTrigger.update);
		lenisRef.current = instance;

		const raf = (time: number) => instance.raf(time * 1000);
		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);

		return () => {
			gsap.ticker.remove(raf);
			gsap.ticker.lagSmoothing(500, 33);
			instance.destroy();
			lenisRef.current = null;
		};
	}, []);

	const scrollTo = useCallback((target: string | HTMLElement) => {
		const lenis = lenisRef.current;
		if (lenis) {
			lenis.scrollTo(target, { offset: -56 });
			return;
		}
		// Before Lenis mounts (or outside the public layout), fall back to native.
		const el = typeof target === "string" ? document.querySelector(target) : target;
		el?.scrollIntoView();
	}, []);

	return <SmoothScrollContext.Provider value={{ lenis: null, scrollTo }}>{children}</SmoothScrollContext.Provider>;
}
