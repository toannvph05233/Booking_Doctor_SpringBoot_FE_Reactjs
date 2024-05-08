import React, {createContext, useContext, useEffect, useState} from 'react';
import {formatCurrency, getTotalDays} from "../../service/format";
import StarsReview from "./StarsReview/StarsReview";
import Description from "./Description/Description";
import Review from "./Review/Review";
import axios from 'axios';
import './houseDetail.scss';
import Facility from "./Facility/Facility";
import {getHouseById} from "../../service/doctorService";
import {avgRatingByHouseId, getAllReviewsByHouseId} from "../../service/reviewService";
import {getAllImagesByHouseId} from "../../service/imageService";
import _ from 'lodash';
import {useNavigate, useParams} from "react-router-dom";
import Images from "./Images/Images";
import {Button, Modal} from "react-bootstrap";
import DatePicker, {registerLocale} from "react-datepicker";
import {addDays, subDays, format} from 'date-fns';
import vi from 'date-fns/locale/vi';
import "react-datepicker/dist/react-datepicker.css";
import {useSelector} from "react-redux";
import Swal from "sweetalert2";
import BookingService from "../../service/BookingService";
import {CircularProgress} from "@mui/material";
import {WebSocketContext} from "../ChatBox/WebSocketProvider";
import {saveNotify} from "../../service/notifyService";

export const HouseDetailContext = createContext();

registerLocale("vi", vi);

const HouseDetail = () => {
    const [showDesc, setShowDesc] = useState('desc');
    const [house, setHouse] = useState({});
    const [pet, setPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState(0);
    const [reviews, setReviews] = useState({});
    const [images, setImages] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [errorStartDate, setErrorStartDate] = useState("");
    const [bookings, setBookings] = useState([]);
    const [validate, setValidate] = useState(false);
    const [hour, setHour] = useState('8h');
    const [content, setContent] = useState(null);
    const [isRender, setIsRender] = useState(false);
    const [isProgressing, setIsProgressing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const {account, unreadNotify} = useSelector(state => state);
    const {sendNotify} = useContext(WebSocketContext);
    const navigate = useNavigate();

    const {houseId} = useParams();

    useEffect(() => {
        getHouseById(houseId).then(response => {
            setHouse(response.data);
            console.log("response.data")
            console.log(response.data)
            getAllImagesByHouseId(houseId).then(res => {
                const avatarImage = {id: res.data.length + 1, url: response.data.thumbnail}
                setImages([avatarImage, ...res.data]);
            }).catch(error => {
                console.log(error);
            })
        }).catch(error => {
            console.log(error);
        })

        avgRatingByHouseId(houseId).then(response => {
            setAvgRating(response.data);
        }).catch(error => {
            console.log(error);
        })

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }, [unreadNotify])

    const getAllPet = (idAccount) => {
        axios.get('http://localhost:8080/api/pets/'+idAccount)
            .then(response => {
                setPets(response.data);
            })
            .catch(error => {
                console.error('Error fetching accounts:', error);
            });
    }

    useEffect(() => {
        getAllReviewsByHouseId(houseId, currentPage - 1).then(response => {
            setReviews(response.data);
        }).catch(error => {
            console.log(error);
        })
    }, [currentPage, unreadNotify])

    const changePage = (e, value) => {
        setCurrentPage(value);
    }
    const changeHour = (e) => {
        setHour(e.target.value);
    };
    const changeContent = (e) => {
        setContent(e.target.value);
    };

    useEffect(() => {
        BookingService.getBookingsByHouseId(houseId).then(response => {
            setBookings(response.data);
        }).catch(error => {
            console.log(error);
        })
    }, [isRender, unreadNotify])

    const handleCloseModal = () => {
        setShowModal(false);
        setStartDate(null);
        setValidate(false);
        setErrorStartDate('');
    }
    const handleShowModal = (doctor) => {
        if (doctor.status === "Đang nghỉ") {
            Swal.fire({
                icon: 'warning',
                title: 'Bác sĩ đang hiện tại chưa làm việc !',
                text: 'Vui lòng quay lại sau',
                showConfirmButton: true,
            }).then();
            return;
        } else if (doctor.owner.id === account.id) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn chính là bác sĩ!',
                text: 'Vui lòng chọn nhà khác để đặt lịch',
                showConfirmButton: true,
            }).then();
            return;
        } else if (_.isEmpty(account)) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn cần đăng nhập để đặt lịch !',
                showConfirmButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            })
            return;
        } else if (!account.firstname || !account.lastname || !account.phone) {
            Swal.fire({
                icon: 'warning',
                title: 'Bạn chưa đầy đủ thông tin cá nhân !',
                text: 'Vui lòng cập nhật đầy đủ thông tin',
                showConfirmButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/profile/edit-profile");
                }
            })
            return;
        }
        setShowModal(true);
        getAllPet(account.id);
    }


    const excludeBookingRange = (bookings) => {
        return bookings.map(booking => {
            return {
                start: subDays(new Date(booking.startTime), 1)
            };
        });
    }

    const includeBookingRange = (startDate, bookings) => {
        const arr = bookings.filter(booking => new Date(booking.startTime) > startDate);
        if (_.isEmpty(arr) || !startDate) return null;
        return [{start: startDate, end: new Date(arr[0].startTime)}];
    }

    const CustomTimeInput = ({time}) => (
        <input
            value={time}
            style={{border: "solid 1px pink"}}
            readOnly={true}
        />
    );

    const handleChangeStartDate = (date) => {
        if (date)
            setStartDate(date.setHours(14));
        setValidate(true);
    }


    const handleBooking = () => {
        const data = {
            startTime: format(new Date(startDate), "yyyy-MM-dd'T'HH:mm:ss"),
            hour: hour,
            content: content,
            total: house.price,
            status: 'Chờ xác nhận',
            doctor: house,
            account: {id: account.id},
            pet:{id:selectedPetId}
        }
        setIsProgressing(true);
        BookingService.bookingHouse(data).then(response => {
            Swal.fire({
                icon: 'success',
                title: 'Đặt lịch khám thành công !',
                text: 'Vui lòng chờ chủ nhà xác nhận',
                showConfirmButton: true,
            }).then();
            setIsProgressing(false);
            setIsRender(!isRender);
            handleCloseModal();
            handleSendNotify();
        }).catch(error => {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Đặt lịch khám thất bại !',
                showConfirmButton: false,
                timer: 1500
            }).then();
        })
    }

    const handleSendNotify = () => {
        const from = format(new Date(startDate), "dd/MM/yyyy");
        const data = {
            sender: account,
            receiver: {id: house.owner.id},
            message: `${account.username} đã đặt lịch khám ${house.name}. Lịch đặt: ${from}`,
            navigate: 'profile/houses-owner-booking'
        }
        saveNotify(data).then(response => {
            sendNotify(response.data);
        }).catch(error => {
            console.log(error)
        })
    }


    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };


    return (
        <HouseDetailContext.Provider value={{house, reviews, changePage}}>
            <div className="container-fluid py-5 container-house-detail">
                <div className="row px-xl-5">
                    <div className="col-lg-6 pb-5">
                        {!_.isEmpty(images) &&
                        <Images images={images}/>
                        }
                    </div>

                    <div className="col-lg-5 ms-5 pb-5">
                        <h3 className="fw-semibold">{house.name}</h3>
                        <div className="d-flex align-items-center mb-3">
                            <div className="me-2 star-review text-warning d-flex align-items-center">
                                <span
                                    className={`fw-semibold me-2 fs-5 ${avgRating ? "" : "d-none"}`}>{avgRating}</span>
                                <StarsReview rating={avgRating}/>
                            </div>
                            <small>({reviews.totalElements} nhận xét)</small>
                        </div>
                        <h3 className="fw-normal mb-4 text-danger">
                            {formatCurrency(house.price - house.price * house.sale / 100)} / Lần khám
                            {house.sale ?
                                <>
                                    <span className="text-muted fs-5 ms-3">
                                         <del>{formatCurrency(house.price)}</del>
                                    </span>
                                    <small className="ms-3 bg-danger rounded text-white fs-6">
                                        -{house.sale}%
                                    </small>
                                </>
                                :
                                null
                            }
                        </h3>
                        <div className="d-flex">
                            <p className="me-4"><i className="fa-solid fa-bed me-2"></i>Dịch vụ : {house.service}</p>
                        </div>
                        <div className="d-flex">
                            <p><i className="fa-solid fa-calendar me-2"></i>Ngày tham gia : {house.createAt}</p>
                        </div>

                        <p className="mb-2">Địa chỉ: {house.address}</p>
                        <p className="mb-2">
                            Điện thoại : {house.phone}
                        </p>

                        <p className="mb-2">
                            Trạng thái: {house.status}
                        </p>

                        <div className="d-flex align-items-center mb-4 pt-2">
                            <button className="btn btn-house px-3 py-2"
                                    onClick={() => handleShowModal(house)}>
                                <i className="bi bi-cart-plus me-2"></i>Đặt lịch ngay
                            </button>

                            <Modal show={showModal} onHide={handleCloseModal}>
                                <Modal.Header closeButton>
                                    <h3 className="text-center text-house">Đặt lịch bác sĩ</h3>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-6">
                                                <label htmlFor="startDate" className="form-label">
                                                    <i className="bi bi-calendar-plus me-2"></i>Ngày đặt lịch
                                                </label>
                                                <DatePicker
                                                    dateFormat="dd/MM/yyyy"
                                                    locale={vi}
                                                    selected={startDate}
                                                    onChange={(date) => handleChangeStartDate(date)}
                                                    selectsStart
                                                    startDate={startDate}
                                                    minDate={new Date().getHours() < 14 ? new Date() : addDays(new Date(), 1)}
                                                    excludeDateIntervals={excludeBookingRange(bookings)}
                                                    className="form-control"
                                                    id="startDate"
                                                    placeholderText="Chọn ngày đặt lịch"
                                                />
                                                <small className="text-danger">{errorStartDate}</small>
                                            </div>
                                            <div className="col-6">
                                                <label htmlFor="endDate" className="form-label">
                                                    <i className="bi bi-calendar3 me-2"></i> Giờ đặt lịch
                                                </label>
                                                <input onChange={changeHour} value={hour}
                                                       placeholder="Nhập giờ bạn muốn đặt"/>
                                            </div>
                                            <div className="col-10" style={{marginTop: '10px'}}>
                                                <label htmlFor="endDate" className="form-label">
                                                    <i className="fas fa-cat me-2"></i> Nhập tình trạng của thú cưng.
                                                </label>
                                                <textarea cols={50} onChange={changeContent} value={content}
                                                          placeholder="Nhập tình trạng của thú cưng."/>
                                            </div>
                                            <div className="col-6">
                                                <label htmlFor="petSelect" className="form-label">
                                                    <i className="bi bi-paw me-2"></i>Chọn thú cưng muốn khám
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="petSelect"
                                                    onChange={(e) => setSelectedPetId(e.target.value)}
                                                >
                                                    <option value="">Chọn pet</option>
                                                    {pet.map((pet, index) => (
                                                        <option key={index} value={pet.id}>
                                                            {pet.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="total-price pt-4">
                                                <h4 className="mb-3">Chi tiết lịch đặt:</h4>
                                                <p className="fs-6 fw-medium">Thời gian
                                                    thuê: ngày {formatDate(startDate)} </p>
                                                <p className="fs-6 fw-medium">Thời gian
                                                    thuê: Giờ {hour} </p>
                                                <p className="fs-6 fw-medium">
                                                    Đơn
                                                    giá: {house.price} VND
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModal} style={{minWidth: '80px'}}>
                                        Hủy
                                    </Button>
                                    <Button variant="primary" onClick={handleBooking}>
                                        Xác nhận
                                    </Button>
                                </Modal.Footer>
                                {isProgressing &&
                                <div
                                    className="w-100 h-100 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
                                    style={{background: 'rgba(0,0,0,0.4)'}}>
                                    <CircularProgress color="success"/>
                                </div>
                                }
                            </Modal>
                        </div>
                    </div>
                </div>
                <div className="row px-xl-5">
                    <div className="col">
                        <div className="nav nav-tabs justify-content-center border-bottom-gray mb-4">
                    <span className={`nav-item nav-link ${showDesc === 'desc' ? 'active' : ''}`}
                          onClick={() => setShowDesc('desc')}>Mô tả</span>
                            <span className={`nav-item nav-link ${showDesc === 'review' ? 'active' : ''}`}
                                  onClick={() => setShowDesc('review')}>Nhận xét ({reviews.totalElements})</span>
                        </div>
                        <div className="tab-content">
                            {showDesc === 'desc' ?
                                <Description/>
                                :
                                < Review/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </HouseDetailContext.Provider>
    );
};

export default HouseDetail;
