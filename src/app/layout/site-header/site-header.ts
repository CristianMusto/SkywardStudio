import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewPart } from '../../shared/view-part';

/** Window event that opens the shortcuts dialog (see layout/shortcuts). */
const OPEN_SHORTCUTS = 'sky-shortcuts';

/** Top bar: logo, language, audio, keyboard shortcuts, map/list switch. */
@Component({
  selector: 'sky-site-header',
  imports: [],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SiteHeader extends ViewPart {
  /** The dialog lives in the Shell, so it also works on pages without this header. */
  protected openShortcuts(): void {
    window.dispatchEvent(new Event(OPEN_SHORTCUTS));
  }
}
