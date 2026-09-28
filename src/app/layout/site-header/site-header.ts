import { ChangeDetectionStrategy, Component, ElementRef, computed, viewChild } from '@angular/core';
import type { UiStrings } from '../../i18n/ui-strings';
import { ViewPart } from '../../shared/view-part';

interface Shortcut {
  /** Key groups; each inner list is one combination, alternatives are joined with "or". */
  keys: string[][];
  label: string;
}
interface ShortcutGroup {
  title: string;
  items: Shortcut[];
}

/** Every shortcut handled by the engine (see engine/input.ts), grouped by screen. */
function shortcutGroups(t: UiStrings): ShortcutGroup[] {
  const arrows = [['←', '→', '↑', '↓']];
  return [
    {
      title: t.scGroupMap,
      items: [
        { keys: arrows, label: t.scPickSystem },
        { keys: [['Enter']], label: t.scJump },
        { keys: [['+'], ['−']], label: t.scZoom },
        { keys: [['Q'], ['E']], label: t.scSpin },
        { keys: [['R'], ['0']], label: t.scRecenter },
        { keys: [['L']], label: t.scList },
        { keys: [['M']], label: t.scMap },
        { keys: [['Esc']], label: t.scEscMap },
      ],
    },
    {
      title: t.scGroupSystem,
      items: [
        { keys: arrows, label: t.scPickPlanet },
        { keys: [['Enter']], label: t.scLand },
        { keys: [['Esc']], label: t.scEscSystem },
        { keys: [['M']], label: t.scMapFromSystem },
      ],
    },
    {
      title: t.scGroupPage,
      items: [
        { keys: [['←'], ['→']], label: t.scPrevNext },
        { keys: [['Esc'], ['M']], label: t.scClosePage },
      ],
    },
    {
      title: t.scGroupMouse,
      items: [
        { keys: [[t.kDrag]], label: t.scDrag },
        { keys: [[t.kShiftDrag]], label: t.scShiftDrag },
        { keys: [[t.kWheel]], label: t.scWheel },
      ],
    },
    {
      title: t.scGroupGeneral,
      items: [
        { keys: [['?']], label: t.scOpenHelp },
        { keys: [['Esc']], label: t.scCloseHelp },
      ],
    },
  ];
}

/** Top bar: logo, language, audio, keyboard shortcuts, map/list switch. */
@Component({
  selector: 'sky-site-header',
  imports: [],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', '(document:keydown)': 'onKey($event)' },
})
export class SiteHeader extends ViewPart {
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('shortcuts');
  protected readonly groups = computed(() => shortcutGroups(this.tr()));

  protected openShortcuts(): void {
    const el = this.dialog()?.nativeElement;
    if (el && !el.open) el.showModal();
  }

  protected closeShortcuts(): void {
    this.dialog()?.nativeElement.close();
  }

  /** Closes when the backdrop (the dialog element itself, outside the panel) is clicked. */
  protected backdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.closeShortcuts();
  }

  /** "?" opens the list, unless the user is typing in a field. */
  protected onKey(e: KeyboardEvent): void {
    if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement | null)?.tagName ?? '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    e.preventDefault();
    this.openShortcuts();
  }
}
