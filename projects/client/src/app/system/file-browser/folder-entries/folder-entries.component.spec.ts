import { describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { PPTFolderEntry } from '@ppt';
import { FolderEntriesComponent } from './folder-entries.component';

describe('FolderEntriesComponent', () => {
    let component: FolderEntriesComponent;
    let fixture: ComponentFixture<FolderEntriesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FolderEntriesComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(FolderEntriesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('renders folder rows before file rows', () => {
        component.entries = [
            { filename: 'app.ts', isFolder: false },
            { filename: 'src', isFolder: true },
        ];
        fixture.detectChanges();

        const rows = Array.from(fixture.nativeElement.querySelectorAll('.row')) as HTMLElement[];
        expect(rows.map((row) => row.querySelector('span')?.textContent?.trim())).toEqual(['src', 'app.ts']);
    });

    it('emits the selected folder entry', () => {
        const folder: PPTFolderEntry = { filename: 'src', isFolder: true };
        let selected: PPTFolderEntry | undefined;
        component.entries = [folder];
        component.clickFileOrFolder.subscribe((entry: PPTFolderEntry) => selected = entry);
        fixture.detectChanges();
        fixture.nativeElement.querySelector('.row').click();

        expect(selected).toEqual(folder);
    });

    it('emits the selected file entry', () => {
        const file: PPTFolderEntry = { filename: 'app.ts', isFolder: false };
        let selected: PPTFolderEntry | undefined;
        component.entries = [file];
        component.clickFileOrFolder.subscribe((entry: PPTFolderEntry) => selected = entry);
        fixture.detectChanges();
        fixture.nativeElement.querySelector('.row').click();

        expect(selected).toEqual(file);
    });

    it('renders no rows when entries are absent', () => {
        fixture.componentRef.setInput('entries', undefined);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.row')).toHaveLength(0);
    });
});
