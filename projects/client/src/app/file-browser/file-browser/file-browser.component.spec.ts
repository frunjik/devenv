import { DevendService } from "../../devenv.service";
import { FileBrowserComponent } from "./file-browser.component";

describe("FileBrowserComponent", () => {
    let component: FileBrowserComponent;

    let devendService: any;

    beforeEach(async () => {
        devendService = {
            getFolder: jasmine.createSpy("getFolder").and.callFake(() => {
                return {
                    subscribe: () => {},
                };
            }),
        };
        component = new FileBrowserComponent(devendService);
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
