import React from 'react';

const Banner = () => {
    return (
        <div className="container mb-5">
            <div id="slide-carousel" className="carousel slide text-center" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#slide-carousel" data-bs-slide-to="0"
                            className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#slide-carousel" data-bs-slide-to="1"
                            aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#slide-carousel" data-bs-slide-to="2"
                            aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active" data-bs-interval="3000">
                        <img
                            src="https://equinemedicalservices.net/wp-content/uploads/2021/07/benh-vien-thu-y-ha-noi-2.jpg"
                            className="img-thumbnail" alt="..." width={1000} style={{height: '550px'}}/>
                        {/*<div className="carousel-caption d-none d-md-block">
                            <h5>First slide label</h5>
                            <p>Some representative placeholder content for the first slide.</p>
                        </div>*/}
                    </div>
                    <div className="carousel-item" data-bs-interval="3000">
                        <img src="https://kenhz.net/wp-content/uploads/2020/02/phong-kham-thu-y-2VET-ha-noi.jpg"
                             className="img-thumbnail" alt="..." width={1000} style={{height: '550px'}}/>
                        {/*<div className="carousel-caption d-none d-md-block">
                            <h5>Second slide label</h5>
                            <p>Some representative placeholder content for the second slide.</p>
                        </div>*/}
                    </div>
                    <div className="carousel-item" data-bs-interval="3000">
                        <img
                            src="https://toplisthanoi.com/wp-content/uploads/2020/11/69770439_2345988212167115_6991920171900207104_o.jpg"
                            className="img-thumbnail" alt="..." width={1000} style={{height: '550px'}}/>
                        {/*<div className="carousel-caption d-none d-md-block">
                            <h5>Third slide label</h5>
                            <p>Some representative placeholder content for the third slide.</p>
                        </div>*/}
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#slide-carousel"
                        data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#slide-carousel"
                        data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    );
};

export default Banner;
