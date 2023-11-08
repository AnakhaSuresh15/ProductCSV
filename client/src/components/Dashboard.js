import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import download from '../../assets/download.png';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCookies } from "react-cookie";

const Dashboard = () => {
    const { state } = useLocation();
    const { username } = state;
    const [file, setFile] = useState([]);
    const navigate = useNavigate();
    const { getRootProps, getInputProps } = useDropzone({ accept: {'text/csv': ['.csv']}, 
    onDrop: (uploadedFile) => {
        setFile(uploadedFile[0]);
        if(uploadedFile[0]) upload(uploadedFile[0], username);
      }, multiple: false});
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [products, setProducts] = useState([]);
    const [showLoading, setshowLoading] = useState(false);
    const [cookies, removeCookie] = useCookies([]);

    useEffect(() => {
        const verifyCookie = async () => {
            if (!cookies.jwt) {
                navigate("/login");
            }
            const { data } = await axios.post(
                "http://localhost:3000",
                {},
                { withCredentials: true }
            );
            const { status, user } = data;
            return !status ? (removeCookie("jwt"), navigate("/login"))  : '';
            };
            verifyCookie();
            setshowLoading(true);
            getView(currentPage, true);

    }, [currentPage], [cookies, navigate, removeCookie]);

    const upload = (file, username) => {
        setshowLoading(true);
        const chunkSize = 5 * 1024 * 1024;
        const totalChunks = Math.ceil(file.size / chunkSize);
        const uploadProgress = 100 / totalChunks;
        let chunkNumber = 0;
        let start = 0;
        let end = 0;

        const uploadNextChunk = async () => {
            if (end <= file.size) {
                end += chunkSize;
                const chunk = file.size < end ? file.slice(start, file.size) : file.slice(start, end);
                const formData = new FormData();
                formData.append("file", chunk);
                formData.append("chunkNumber", chunkNumber);
                formData.append("totalChunks", totalChunks);
                formData.append("originalname", file.name);
                formData.append("username", username);

                axios({
                method: "POST",
                url: "http://localhost:3000/dashboard/upload",
                data: formData,
                })
                .then((response) => console.log(response))
                .then((data) => {
                    console.log({ data });
                    const temp = `Chunk ${
                    chunkNumber + 1
                    }/${totalChunks} uploaded successfully`;
                    setStatus(temp);
                    setProgress(Number((chunkNumber + 1) * uploadProgress));
                    console.log(temp);
                    chunkNumber++;
                    start = end;
                    uploadNextChunk();
                })
                .catch((error) => {
                    console.error("Error uploading chunk:", error);
                    setshowLoading(false);
                    handleError(error?.response?.data?.error);
                });
            } else {
                setProgress(100);
                setStatus("File upload completed");
                getView(currentPage, false);
            }
            };

            uploadNextChunk();
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage- 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const showError = (text) => {
        toast.error(text, {
            position: toast.POSITION.TOP_RIGHT
        });
    };

    const handleError = (err) => {
        if(err == "not product csv") {
                showError("Please upload product CSV only!");
        } else if(err == "Error saving chunk") {
            showError("Something went wrong while uploding the file. Please try again later");
        } else if(err == "Error retrieving data") {
            showError("Unable to retrieve data at this time. Please try again later");
        }
    }

    const getView = async (page, onload) => {
        try {
            if(onload) setshowLoading(true);
            const res = await axios.get(`http://localhost:3000/dashboard/view?page=${page}&username=${username}`,
            {withCredentials: true, credentials: 'include'});
            const { products, totalPages, isUpdated } = res.data;
            setProducts(products);
            setTotalPages(totalPages);
            if(!onload) {
                if(isUpdated) {
                    toast.info("Your file is imported and the table is updated!", {
                        position: toast.POSITION.TOP_RIGHT
                    });
                } else {
                    getView(currentPage, false);
                }
            }
            setshowLoading(false);
        } catch (error) {
            console.log(error);
            setshowLoading(false);
            handleError(error?.response?.data?.error);
        }
    }


    return (
        <>
            <div className="dashboard">
                <div {...getRootProps()} className="drop-area">
                    <input {...getInputProps()} />
                    <img src={download} className="image" />
                    <p>Drag and drop files here or click to browse.</p>
                </div>
                {!showLoading && products && products.length === 0 && <div className="no-products">Import files to view products here...</div>}
                {!showLoading && products && products.length > 0 && <div className="table-container">
                        <table>
                            <thead>
                                 <tr>
                                    <th>product_name</th>
                                    <th>price</th>
                                    <th>sku</th>
                                    <th>description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products && products.map((product, productId) => 
                                    <tr key={productId}>
                                    <td key={product.id}>{product.product_name}</td>
                                    <td key={product.id}>{product.price}</td>
                                    <td key={product.id}>{product.sku}</td>
                                    <td key={product.id}>{product.description}</td>
                                    </tr>
                                )}
                            </tbody>
                         </table>
                        <div className="bottom-buttons">
                            <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                Previous Page
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Next Page
                            </button>
                            <div className="pageNumber">{currentPage}/{totalPages}</div>
                        </div>
                </div>}
                {showLoading && <div className="loader"></div>}
            </div>
            <ToastContainer />
        </>
    )
}

export default Dashboard;