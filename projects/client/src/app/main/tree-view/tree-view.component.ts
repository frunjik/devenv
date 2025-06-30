import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// export function listToDict<T>(list: Array<T>, idKey = 'name'): Record<string, any> {

//     const result: Record<string, T> = {};

//     list
//         .forEach((each: any) => {
//             result[each[idKey] ?? idKey] = each;
//         });

//     return result;
// }

// export function dictToList<T>(dict: Record<string, any>): Array<T> {

//     const result: Array<T> = [];

//     Object.values(dict)
//         .forEach((each: T) => {
//             result.push(each);
//         });

//     return result;
// }

interface PPTNode {
    name: string;
    value?: any;
    children?: PPTNode[];
}

function listToNode(list: Array<PPTNode>): PPTNode {
    return {
        name: '',
        children: list
    }
}

function nodeToList(node: PPTNode): Array<PPTNode> {
    return node.children ?? [];
}

function dictToNode(dict: Record<string, PPTNode> = {}): PPTNode {
    return {
        name: '',
        children: Object.entries(dict)
            .map(([k, v]) => {
                return {
                    name: k,
                    value: v
                }
            })
    }
}

function nodeToDict(node: PPTNode): Record<string, PPTNode> {
    const result: Record<string, PPTNode> = {};

    node.children?.forEach((each: PPTNode) => {
        result[each.name] = each.children ?? each.value;
    });

    return result;
}

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
const EXAMPLE_DATA: PPTNode[] = [
    {
        name: 'Fruit',
        children: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Fruit loops' }],
    },
    {
        name: 'Vegetables',
        children: [
            {
                name: 'Green',
                children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }],
            },
            {
                name: 'Orange',
                children: [{ name: 'Pumpkins' }, { name: 'Carrots' }],
            },
        ],
    },
];









@Component({
    selector: 'em-tree-view',
    imports: [
        MatButtonModule, 
        MatIconModule,
        MatTreeModule, 
    ],
    templateUrl: './tree-view.component.html',
    styleUrl: './tree-view.component.scss'
})
export class TreeViewComponent {
    dataSource = EXAMPLE_DATA;
    //   dataSource = input(EXAMPLE_DATA);

    childrenAccessor = (node: PPTNode) => node.children ?? [];

    hasChild = (_: number, node: PPTNode) => !!node.children && node.children.length > 0;
}

// /**
//  * @title Tree with flat nodes (childrenAccessor)
//  */
// @Component({
//   selector: 'tree-flat-child-accessor-overview-example',
//   templateUrl: 'tree-flat-child-accessor-overview-example.html',
//   imports: [MatTreeModule, MatButtonModule, MatIconModule],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class TreeFlatChildAccessorOverviewExample {
//   dataSource = EXAMPLE_DATA;

//   childrenAccessor = (node: FoodNode) => node.children ?? [];

//   hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;
// }

// const EXAMPLE_DATA: FoodNode[] = [
//   {
//     name: 'Fruit',
//     children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
//   },
//   {
//     name: 'Vegetables',
//     children: [
//       {
//         name: 'Green',
//         children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
//       },
//       {
//         name: 'Orange',
//         children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
//       },
//     ],
//   },
// ];
