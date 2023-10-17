## Lấy danh sách sản phẩm (GET)

#### Sử dụng đường dẫn endpoint sau:
/api/getProduct

#### có thể truyền thêm điều kiện để truy vấn:
/api/getProduct?condition=where Id = 1

## Thêm sản phẩm (POST)

#### sử dụng đường dẫn endpoint sau:
/api/addProduct

- truyền một json với các dữ liệu:

{
    "UserId": 1,
    "CategoryId": 1,
    "Images": "/Images/defaultAvatar.jpg",
    "Productname": "Test",
    "Quantity": 1,
    "Price": 123456789
}
##### trong đó:
- UserId = Id người dùng || người bán
- CategoryId = Id danh mục sản phẩm
- Images = Đường dẫn url hình ảnh
- Productname = Tên sản phẩm
- Quantity = Số lượng sản phẩm
- Price = Giá bán

## Cập nhật sản phảm (PATCH)

#### sử dụng đường dẫn endpoint sau:
/api/editProduct

- Truyền một json với các dữ liệu:

{
    "Id": 9,
    "UserId": 1,
    "CategoryId": 1,
    "Images": "/Images/defaultAvatar.jpg",
    "Productname": "ABCDEFG",
    "Quantity": 1,
    "Price": 123456789
}

##### trong đó:
- Id = Id sản phẩm muốn cập nhật
- UserId = Id người dùng || người bán
- CategoryId = Id danh mục sản phẩm
- Images = Đường dẫn url hình ảnh
- Productname = Tên sản phẩm
- Quantity = Số lượng sản phẩm
- Price = Giá bán
- Các trường này có thể để trống trừ trường Id

## Xoá sản phẩm (DELETE)

#### sử dụng đường dẫn endpoint sau:
/api/deleteProduct

- Truyền một json dữ liệu:
{
    "Id": 1 || [1, 2, 3]
}

##### trong đó:
- Id = Id sản phẩm muốn xoá
- Có thể truyền một Id để xoá 1 sản phẩm duy nhất hoặc có thể truyền vào một mảng để xoá tất cả dữ liệu