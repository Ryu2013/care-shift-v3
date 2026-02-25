resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-igw"
  }
}

# Public Subnets (ALB)
resource "aws_subnet" "public_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.0.0/24"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "${var.project}-public-1a"
  }
}

resource "aws_subnet" "public_1c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-northeast-1c"

  tags = {
    Name = "${var.project}-public-1c"
  }
}

# Private Subnets (EC2)
resource "aws_subnet" "private_ec2_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "${var.project}-private-ec2-1a"
  }
}

resource "aws_subnet" "private_ec2_1c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "ap-northeast-1c"

  tags = {
    Name = "${var.project}-private-ec2-1c"
  }
}

# Private Subnets (RDS)
resource "aws_subnet" "private_rds_1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.20.0/24"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "${var.project}-private-rds-1a"
  }
}

resource "aws_subnet" "private_rds_1c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.21.0/24"
  availability_zone = "ap-northeast-1c"

  tags = {
    Name = "${var.project}-private-rds-1c"
  }
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project}-public-rt"
  }
}

resource "aws_route_table_association" "public_1a" {
  subnet_id      = aws_subnet.public_1a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_1c" {
  subnet_id      = aws_subnet.public_1c.id
  route_table_id = aws_route_table.public.id
}

# Private Route Table (EC2・RDS共用)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-private-rt"
  }
}

resource "aws_route_table_association" "private_ec2_1a" {
  subnet_id      = aws_subnet.private_ec2_1a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_ec2_1c" {
  subnet_id      = aws_subnet.private_ec2_1c.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_rds_1a" {
  subnet_id      = aws_subnet.private_rds_1a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_rds_1c" {
  subnet_id      = aws_subnet.private_rds_1c.id
  route_table_id = aws_route_table.private.id
}
