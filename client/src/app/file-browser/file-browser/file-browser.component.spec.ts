import { FileBrowserComponent } from "./file-browser.component";

describe("FileBrowserComponent", () => {
    let component: FileBrowserComponent;

    let backendService: any;

    beforeEach(async () => {
        backendService = {
            getFolder: jasmine.createSpy("getFolder").and.callFake(() => {
                return {
                    subscribe: () => {},
                };
            }),
        };
        component = new FileBrowserComponent(backendService);
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
