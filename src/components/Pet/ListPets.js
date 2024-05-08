import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const ListPets = () => {
    const account = useSelector(state => state.account);
    const [pet, setPets] = useState([]);
    const [newPetData, setNewPetData] = useState({
        name: '',
        birthday: '',
        weight: ''
    });

    useEffect(() => {
        getAllPet(account.id);
    }, [])

    const getAllPet = (idAccount) => {
        axios.get('http://localhost:8080/api/pets/' + idAccount)
            .then(response => {
                setPets(response.data);
            })
            .catch(error => {
                console.error('Error fetching accounts:', error);
            });
    }

    const showCreatePet = () => {
        Swal.fire({
            title: 'Tạo thú cưng mới',
            html:
                '<input id="name" class="swal2-input" placeholder="Name">' +
                '<input id="birthday" type="date" class="swal2-input" placeholder="Birthday">' +
                '<input id="weight" class="swal2-input" placeholder="Weight">',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Đóng',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const birthday = Swal.getPopup().querySelector('#birthday').value;
                const weight = Swal.getPopup().querySelector('#weight').value;
                setNewPetData({ name, birthday, weight });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                createPet();
            }
        })
    }

    const showHistoryBooking = (idPet) => {
        axios.get('http://localhost:8080/api/pets/booking/' + idPet)
            .then(response => {
                const bookings = response.data;
                const tableRows = bookings.map((booking, index) => (
                    `<tr key=${index}>
                    <td>${index + 1}</td>
                    <td>${booking.startTime}</td>
                    <td>${booking.result}</td>
                </tr>`
                )).join(''); // Chuyển đổi mảng thành chuỗi HTML

                Swal.fire({
                    title: 'Lịch sử khám bệnh',
                    html: `
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                `,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Xác nhận',
                    cancelButtonText: 'Đóng'
                });
            })
            .catch(error => {
                console.error('Error fetching:', error);
            });
    }


    const createPet = () => {
        axios.post('http://localhost:8080/api/pets', {
            ...newPetData,
            account: {id:account.id}
        })
            .then(response => {
                Swal.fire({
                    title: 'Tạo thú cưng thành công!',
                    icon: 'success',
                });
                // Sau khi tạo thành công, cập nhật danh sách thú cưng
                getAllPet(account.id);
            })
            .catch(error => {
                console.error('Error creating pet:', error);
                Swal.fire({
                    title: 'Tạo thú cưng thất bại!',
                    icon: 'error',
                });
            });
    }

    const editPet = (petId) => {
        Swal.fire({
            title: 'Sửa thông tin thú cưng',
            html:
                '<input id="name" class="swal2-input" placeholder="Name">' +
                '<input id="birthday" type="date" class="swal2-input" placeholder="Birthday">' +
                '<input id="weight" class="swal2-input" placeholder="Weight">',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const birthday = Swal.getPopup().querySelector('#birthday').value;
                const weight = Swal.getPopup().querySelector('#weight').value;
                // Gọi hàm để cập nhật thông tin thú cưng
                updatePet(petId, { name, birthday, weight });
            }
        });
    }

    const updatePet = (petId, newData) => {
        axios.put(`http://localhost:8080/api/pets/${petId}`, newData)
            .then(response => {
                Swal.fire({
                    title: 'Cập nhật thông tin thú cưng thành công!',
                    icon: 'success',
                });
                // Sau khi cập nhật thành công, cập nhật danh sách thú cưng
                getAllPet(account.id);
            })
            .catch(error => {
                console.error('Error updating pet:', error);
                Swal.fire({
                    title: 'Cập nhật thú cưng thất bại!',
                    icon: 'error',
                });
            });
    }

    const deletePet = (petId) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:8080/api/pets/${petId}`)
                    .then(response => {
                        Swal.fire({
                            title: 'Xóa thành công!',
                            icon: 'success',
                        });
                        // Sau khi xóa thành công, cập nhật danh sách thú cưng
                        getAllPet(account.id);
                    })
                    .catch(error => {
                        console.error('Error deleting pet:', error);
                        Swal.fire({
                            title: 'Xóa thất bại!',
                            icon: 'error',
                        });
                    });
            }
        });
    }

    return (
        <div className='col-9'>
            <h1>Danh sách thú cưng của bạn</h1>
            <button type="button" onClick={showCreatePet} className="btn btn-primary">Create Pet</button>

            <table className="table">
                <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Birthday</th>
                    <th scope="col">Weight</th>
                    <th scope="col">History</th>
                    <th scope="col">Edit</th>
                    <th scope="col">Delete</th>
                </tr>
                </thead>
                <tbody>
                {
                    pet.map((p, index) =>
                        <tr key={p.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{p.name}</td>
                            <td>{p.birthday}</td>
                            <td>{p.weight} kg</td>
                            <td>
                                <button type="button" className="btn btn-info" onClick={()=>{showHistoryBooking(p.id)}}>History</button>
                            </td>
                            <td>
                                <button type="button" onClick={() => editPet(p.id)} className="btn btn-warning">Edit</button>
                            </td>
                            <td>
                                <button type="button" onClick={() => deletePet(p.id)} className="btn btn-danger">Delete</button>
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </table>
        </div>
    )
}

export default ListPets;
