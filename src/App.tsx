import React, {SFC} from 'react';
import logo from './logo.svg';
import './App.css';
import {
    adapter,
    graphModel,
    GraphVisualizer,
    IGraphView,
    store,
    Template,
    Toolbar,
    ToolButtonList
} from "graphlabs.core.template";
import {IVertex,IGraph, IEdge, GraphGenerator, Graph, Vertex, Edge} from 'graphlabs.core.graphs';

import {Matrix,  } from 'graphlabs.core.lib';
import {rename} from "fs";







class App extends Template
{
    task_part =1;
    chekc_count=0; // количество проверок

    graph: IGraph<IVertex, IEdge> = GraphGenerator.generate(0);
    matrix: number [][] = this.get_matrix_by_variant();
//    matrix:number[][] = [[0,1,1,1],
//                         [1,0,0,0],
//                         [1,0,0,0],
//                         [1, 0,0,0]]

    constructor(props:{})
    {

        super(props);
        this.getArea = this.getArea.bind(this);
        this.calculate = this.calculate.bind(this);

        console.log("constructor")
    }


    componentWillMount()
    {
        //для инициализации графа
        let graphModel:  IGraph<IVertex, IEdge> = new Graph() as unknown as IGraph<IVertex, IEdge>;
        let init:(graph: IGraph<IVertex, IEdge>) => void;
        init = function (graph: IGraph<IVertex, IEdge>) {
            graphModel = graph;
        }
        //

        init(this.graph);

        console.log("component")
    }

    protected getArea(): React.SFC<{}>
    {
  //      this.graph = this.empty_graph();
       // this.graph = this.graph_by_variant();
   //    this.matrix = this.get_matrix_by_variant();
        console.log("getArea");
        return () => <GraphVisualizer
           graph = {graphModel} //вот здесь не генерится
          // graph={this.graph}
        //    graph = { GraphGenerator.generate(0)}
            adapterType={'writable'}
            incidentEdges={false}
            weightedEdges={false}
            namedEdges={true}
        />;

    }


    private get_matrix_by_variant():number[][]
    {
        const data = sessionStorage.getItem('variant');
        let matrix:number[][] = [];
        let objectData;
        try
        {
            objectData = JSON.parse(data || 'null');
            console.log('The variant is successfully parsed');
        }
        catch(err)
        {
            console.log('Error while JSON parsing');
        }
        console.log(this.matrixManager(objectData.data[0].value));
        if(data)
        {
            matrix=this.matrixManager(objectData.data[0].value);
            console.log('The matrix is successfully built from the variant');
        }

        console.log("matrix_by var");
        return matrix;
    }

    getTaskToolbar()
    {
        console.log("toolbar");
        Toolbar.prototype.getButtonList = () => {
            function beforeComplete(this: App):  Promise<{ success: boolean; fee: number }> {
                return new Promise((resolve => {
                    resolve(this.calculate());
                }));
            }
            ToolButtonList.prototype.beforeComplete = beforeComplete.bind(this);
            ToolButtonList.prototype.help = () =>
                'В данном задании необходимо построить граф по данной матрице смежности';


            return ToolButtonList;
        };
        return Toolbar;
    }


//для разработки
/*
    private empty_graph():IGraph<IVertex, IEdge>{
        const data = sessionStorage.getItem('variant');
        let graph: IGraph<IVertex, IEdge> = new Graph() as unknown as IGraph<IVertex, IEdge>;
        let objectData;
        try {
            objectData = JSON.parse(data || 'null');
        } catch (err) {
            console.log('Error while JSON parsing');
        }
        if (objectData && objectData.data[0] && objectData.data[0].type === 'graph') {
            graph = this.graphManager(objectData.data[0].value);
            const vertices = objectData.data[0].value.graph.vertices;
            const edges  = objectData.data[0].value.graph.edges;
            vertices.forEach((v: any) => {
                graph.addVertex(new Vertex(v));
            });
            edges.forEach((e: any) => {
                if (e.name) {
                    graph.addEdge(new Edge(graph.getVertex(e.source)[0], graph.getVertex(e.target)[0], e.name[0]));
                } else {
                    graph.addEdge(new Edge(graph.getVertex(e.source)[0], graph.getVertex(e.target)[0],Math.round(Math.random()*10).toString() ));
                }
            });
        }
        return graph;
    }
*/



    private get_matrixAdjacency_byGraph(student_graph:IGraph<IVertex, IEdge>): number[][]
    {
        let result: number[][]=[];
        const dim: number = student_graph.vertices.length;

        for (let i: number=0; i<dim;i++)
        {
            result.push([]);
            for (let j: number = 0; j<dim;j++)
            {
                if (student_graph.vertices[i].isAdjacent(student_graph, student_graph.vertices[j])) {
                    result[i].push(1);

                } else {
                    result[i].push(0);
                }

            }
        }

        console.log(result);
        return result;
    }




    private graph_check(): boolean
    {
        let flag: boolean = true;

        let matrixAdj_by_student_graph:number[][] = this.get_matrixAdjacency_byGraph(graphModel);

        let i:number =0;
        let j:number =0;


        if(this.graph.vertices.length===this.matrix.length)
        {
            while (flag && i<this.graph.vertices.length)
            {
                    if(matrixAdj_by_student_graph[i][i]===0)
                    {
                        j=i+1;
                        while (flag && j < this.graph.vertices.length)
                        {
                            if(matrixAdj_by_student_graph[i][j]!==matrixAdj_by_student_graph[j][i] || matrixAdj_by_student_graph[i][j] !== this.matrix[i][j])
                            {
                                flag=false;
                                this.chekc_count+=1;
                            }
                            j+=1;
                        }
                    }
                    else
                    {
                        flag=false;
                        this.chekc_count+=1;
                    }
                    i+=1;

            }
        }
        else
        {
            flag=false;
            this.chekc_count+=1;
        }

        console.log("check");
        console.log(flag);

        return flag;
    }


    // @ts-ignore
    task(): FunctionComponent<{}> {

        if (this.task_part === 1) {
            return () =>
                <div>
                    <form>
                        <span> Постройте граф по данной матрице смежности </span>
                        <br/>
                        <span> Матрица смежности </span>
                        <Matrix rows={this.matrix.length}
                                columns={this.matrix.length}
                                readonly={true}
                                defaultValues={this.matrix}/>
                    </form>
                </div>
        }
    }




    private calculate()
    {
        let isChecked = this.graph_check();
        let res=0;
        if(!isChecked) {
            res = (this.graph.vertices.length + this.graph.edges.length) * this.chekc_count;
        }
        return {success: res===0, fee: res}
    }
}

export default App;
