import {
	type InverseTypeofMapE,
	type PrimitiveOfE,
	genericTypeofGuardE,
	primitiveOfE,
} from "sources/utils/typeof"
import { inSet, isHomogenousArray } from "sources/utils/util"
import type { DeepWritable } from "ts-essentials"
import type { Sized } from "sources/utils/types"
import deepEqual from "deep-equal"

export interface Fixed<T> {
	readonly value: DeepWritable<T>
	readonly valid: boolean
}
export type Unchecked<T> = { readonly [_ in keyof T]?: unknown }

export function launderUnchecked<T>(value: unknown): Unchecked<T> {
	const ret = {}
	Object.assign(ret, value)
	return ret
}

export function markFixed<T>(
	unchecked: unknown,
	fixed: DeepWritable<T>,
): Fixed<T> {
	return {
		valid: deepEqual(unchecked, fixed, { strict: true }),
		value: fixed,
	}
}

export function fixTyped<S, K extends keyof S>(
	defaults: S,
	from: Unchecked<S>,
	key: K,
	types: readonly InverseTypeofMapE<S[K]>[],
): PrimitiveOfE<S[K]> {
	const val = from[key]
	return genericTypeofGuardE(types, val) ? val : primitiveOfE(defaults[key])
}

export function fixArray<S,
	K extends keyof S,
	V extends S[K] extends readonly (
		infer V0)[] ? V0 : never,
>(
	defaults: S,
	from: Unchecked<S>,
	key: K,
	types: readonly InverseTypeofMapE<V>[],
): PrimitiveOfE<V>[] {
	const val = from[key]
	if (isHomogenousArray(types, val)) { return val }
	const default0 = defaults[key]
	if (!Array.isArray(default0)) { throw new TypeError(String(default0)) }
	const default1: readonly V[] = default0
	return default1.map(primitiveOfE)
}

export function fixInSet<S, K extends keyof S, Vs extends readonly S[K][]>(
	defaults: S,
	from: Unchecked<S>,
	key: K,
	set: Sized<Vs>,
): Vs[number] {
	const val = from[key]
	return inSet(set, val) ? val : defaults[key]
}
