import { useCallback, useEffect, useRef } from "react";

/** 디바운스 실행/제어 메서드 묶음. */
interface DebouncedCallback<Args extends unknown[]> {
  /** 디바운스 실행. 마지막 호출로부터 delay(ms) 뒤 한 번만 콜백이 실행된다. */
  run: (...args: Args) => void;
  /** 대기 중인 호출을 취소한다(실행하지 않음). */
  cancel: () => void;
  /** 대기 중인 호출이 있으면 지연을 건너뛰고 즉시 실행한다. */
  flush: () => void;
}

/**
 * 콜백을 디바운스해서 돌려준다. run()을 연속 호출하면 마지막 호출로부터
 * delay(ms) 뒤 한 번만 실행된다. 입력 즉시 검색(onChange 디바운스) 같은 곳에서
 * 쓰며, Enter·버튼 클릭 시 flush()로 즉시 실행하거나 cancel()로 취소할 수 있다.
 * 반환 메서드는 안정적인 identity를 가지며, 언마운트 시 대기 타이머는 자동 정리된다.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): DebouncedCallback<Args> {
  // 최신 콜백·지연을 참조한다(디바운스 타이머는 유지하면서 값만 갱신).
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);
  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delay;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  // 언마운트 시 대기 타이머 정리.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current && lastArgsRef.current) {
      const args = lastArgsRef.current;
      cancel();
      callbackRef.current(...args);
    }
  }, [cancel]);

  const run = useCallback((...args: Args) => {
    lastArgsRef.current = args;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      lastArgsRef.current = null;
      callbackRef.current(...args);
    }, delayRef.current);
  }, []);

  return { run, cancel, flush };
}
