import { FuzzySuggestModal, type WorkspaceLeaf } from "obsidian"
import { PLATFORM, isUndefined } from "sources/utils/util"
import { Settings } from "sources/settings/data"
import type { TerminalPlugin } from "sources/main"
import { TerminalView } from "./view"

export class SelectProfileModal
	extends FuzzySuggestModal<Settings.Profile.Entry> {
	public constructor(
		protected readonly plugin: TerminalPlugin,
		protected readonly cwd?: string,
	) {
		super(plugin.app)
	}

	public override getItems(): Settings.Profile.Entry[] {
		return Object.entries(this.plugin.settings.profiles)
	}

	public override getItemText([id, profile]: Settings.Profile.Entry): string {
		return this.plugin.language.i18n.t(
			`components.select-profile.item-text-${Settings.Profile
				.isCompatible(profile, PLATFORM)
				? ""
				: "incompatible"}`,
			{
				id,
				interpolation: { escapeValue: false },
				name: Settings.Profile.name(profile),
				profile,
			},
		)
	}

	public override onChooseItem(
		[, profile]: Settings.Profile.Entry,
		_evt: KeyboardEvent | MouseEvent,
	): void {
		const { plugin, cwd } = this
		spawnTerminal(plugin, profile, cwd)
	}
}

export function spawnTerminal(
	plugin: TerminalPlugin,
	profile: Settings.Profile,
	cwd?: string,
): void {
	(async (): Promise<void> => {
		try {
			const { app } = plugin,
				{ workspace } = app,
				existingLeaves = workspace
					.getLeavesOfType(TerminalView.type.namespaced(plugin))
			await ((): WorkspaceLeaf => {
				const existingLeaf = existingLeaves.at(-1)
				if (isUndefined(existingLeaf)) {
					return workspace.getLeaf("split", "horizontal")
				}
				workspace.setActiveLeaf(existingLeaf, { focus: false })
				return workspace.getLeaf("tab")
			})()
				.setViewState({
					active: true,
					state: {
						cwd: cwd ?? null,
						profile,
						serial: null,
					} satisfies TerminalView.State,
					type: TerminalView.type.namespaced(plugin),
				})
		} catch (error) {
			console.error(error)
		}
	})()
}
