// import { FileBrowserComponent } from "./file-browser.component";
// import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
// import { of } from "rxjs";

// describe("FileBrowserComponent", () => {
//     let component: FileBrowserComponent;
//     let backendService: any;
//     let router: jasmine.SpyObj<Router>;

//     beforeEach(async () => {
//         backendService = {
//             loadFolder: jasmine.createSpy("loadFolder").and.returnValue(of([])),
//             loadFile: jasmine.createSpy("loadFile").and.returnValue(of("file contents")),
//         };
//         router = jasmine.createSpyObj<Router>("Router", ["navigate"]);
//         const route = {
//             queryParamMap: of(convertToParamMap({
//                 path: "/projects",
//                 file: "/projects/example.html",
//             })),
//         } as ActivatedRoute;
//         component = new FileBrowserComponent(backendService, route, router);
//     });

//     it("should create", () => {
//         expect(component).toBeTruthy();
//     });

//     it("should restore the folder and selected file from the URL", () => {
//         component.ngOnInit();

//         expect(component.pathname()).toBe("/projects");
//         expect(component.filename()).toBe("/projects/example.html");
//         expect(component.fileContent).toBe("file contents");
//     });

//     it("should write the selected folder and file to the URL", () => {
//         component.clickFileOrFolder({ filename: "example.html", isFolder: false });

//         expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
//             queryParams: {
//                 path: null,
//                 file: "/example.html",
//             },
//         }));
//     });
// });
